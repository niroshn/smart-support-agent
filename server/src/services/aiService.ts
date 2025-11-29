import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { Message, StreamingResponse } from "../types/index.js";
import { getContextForQuery } from "./vectorService.js";

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
    model: "claude-sonnet-4-5-20250929",
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
    // Retrieve relevant context from vector store using RAG
    const productContext = await getContextForQuery(newMessage);

    const systemMessage = `You are the MoneyHero AI Assistant, a helpful financial advisor specializing in credit cards and personal loans in Singapore.

Use the provided Knowledge Base to answer the User's Question accurately and comprehensively.

Knowledge Base:
${productContext}

Guidelines:
- Answer based on the Knowledge Base provided above
- If the answer isn't in the Knowledge Base, say "I don't have that specific information in my current knowledge base"
- Be helpful, concise, and professional
- When comparing products, highlight key differences in benefits, fees, and eligibility
- Format your response in clean Markdown
- Use bullet points and tables where appropriate for better readability
- Include specific numbers and details when available
- If discussing fees or charges, be clear and transparent`;

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
