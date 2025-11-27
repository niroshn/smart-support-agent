import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { KNOWLEDGE_BASE } from "../data/products.js";
import { Message, StreamingResponse } from "../types/index.js";

// Helper: Create a stream from a static string
async function* stringToStream(text: string): AsyncIterable<string> {
  const chunks = text.match(/.{1,15}/g) || [text];
  for (const chunk of chunks) {
    yield chunk;
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

// Convert app messages to LangChain message format
function convertToLangChainMessages(messages: Message[]): BaseMessage[] {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => {
      if (m.role === 'user') {
        return new HumanMessage(m.content);
      } else {
        return new AIMessage(m.content);
      }
    });
}

// Main Service Function
export const sendMessageToAgent = async (
  currentHistory: Message[],
  newMessage: string,
  apiKey: string
): Promise<StreamingResponse> => {
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found");

  // Initialize Claude with LangChain
  const model = new ChatAnthropic({
    model: "claude-3-5-sonnet-20241022",
    anthropicApiKey: apiKey,
    temperature: 0,
    streaming: true,
  });

  try {
    // Step 1: Intent Classification
    const classificationPrompt = ChatPromptTemplate.fromMessages([
      ["system", `You are the Intent Classifier for MoneyHero Support.
Analyze the User Query and classify it into EXACTLY ONE of these categories:

1. ESCALATE - User is angry, frustrated, explicitly asks for human/person/agent, or threatens to leave.
2. OFF_TOPIC - Query is completely unrelated to finance, banking, loans, or credit cards (e.g. "how to cook pasta", "weather").
3. ANSWER - Query is about financial products, loans, credit cards, comparisons, greetings, or general financial help.

Output ONLY the category name (ESCALATE, OFF_TOPIC, or ANSWER).`],
      ["human", "{query}"]
    ]);

    const classificationChain = classificationPrompt.pipe(model).pipe(new StringOutputParser());
    const intent = (await classificationChain.invoke({ query: newMessage })).trim().toUpperCase();

    // Step 2: Handle Non-Chat Intents (Static Streams)
    if (intent.includes("ESCALATE")) {
      return {
        stream: stringToStream(
          "I understand your frustration. I have flagged this conversation for immediate human assistance. An agent will be with you shortly."
        ),
        isEscalation: true,
      };
    }

    if (intent.includes("OFF_TOPIC")) {
      return {
        stream: stringToStream(
          "I specialize in financial advice, credit cards, and loans. I can't really help with that topic, but I'd be happy to answer any banking questions you have!"
        ),
        isEscalation: false,
      };
    }

    // Step 3: Generate Answer (Streaming)
    // Format fees without JSON.stringify to avoid LangChain template variable conflicts
    const formatFees = (fees: any) => {
      return Object.entries(fees)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    };

    const productContext = KNOWLEDGE_BASE.map(p =>
      `Name: ${p.name}\nType: ${p.type}\nFeatures: ${p.features.join(', ')}\nFees: ${formatFees(p.fees)}\nInterest: ${p.interestRate}\nEligibility: ${p.eligibility}\nDescription: ${p.description}`
    ).join('\n\n');

    const systemMessage = `You are the MoneyHero AI Assistant.
Use the provided Knowledge Base to answer the User's Question.

Knowledge Base:
${productContext}

Guidelines:
- Only use the Knowledge Base provided. If the answer isn't there, say "I don't have that information".
- Be helpful, concise, and professional.
- If comparing products, list pros/cons based on data.
- Format your response in clean Markdown.`;

    // Create chat prompt with conversation history
    const chatPrompt = ChatPromptTemplate.fromMessages([
      ["system", systemMessage],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"]
    ]);

    // Convert message history
    const chatHistory = convertToLangChainMessages(currentHistory);

    // Create the chain
    const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());

    // Stream the response
    const stream = await chain.stream({
      chat_history: chatHistory,
      input: newMessage
    });

    // Convert LangChain stream to our format
    async function* streamGenerator() {
      for await (const chunk of stream) {
        if (chunk) {
          yield chunk;
        }
      }
    }

    return {
      stream: streamGenerator(),
      isEscalation: false,
    };

  } catch (error) {
    console.error("Claude API Error:", error);
    return {
      stream: stringToStream("I'm experiencing a temporary connection issue. Please try again."),
      isEscalation: false,
    };
  }
};
