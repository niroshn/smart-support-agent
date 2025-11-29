import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ChatAnthropic } from '@langchain/anthropic';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import { getContextForQuery, initializeVectorStoreIfNeeded } from '../server/src/services/vectorService';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isEscalation?: boolean;
}

// Convert app messages to LangChain message format
function convertToLangChainMessages(messages: Message[]): BaseMessage[] {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (m.role === 'user') {
        return new HumanMessage(m.content);
      }
      return new AIMessage(m.content);
    });
}

// Helper: Create a stream from a static string
async function* stringToStream(text: string): AsyncIterable<string> {
  const chunks = text.match(/.{1,15}/g) || [text];
  for (const chunk of chunks) {
    yield chunk;
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, newMessage } = req.body;

  // Validate request
  if (!newMessage || !messages) {
    return res.status(400).json({ error: 'Missing required fields: messages and newMessage' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    // Initialize vector store if needed (cached in memory)
    await initializeVectorStoreIfNeeded();

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Initialize Claude with LangChain
    const model = new ChatAnthropic({
      model: 'claude-sonnet-4-5-20250929',
      anthropicApiKey: apiKey,
      temperature: 0,
      streaming: true,
    });

    // Step 1: Intent Classification
    const classificationPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are the Intent Classifier for MoneyHero Support.
Analyze the User Query and classify it into EXACTLY ONE of these categories:

1. ESCALATE - User is angry, frustrated, explicitly asks for human/person/agent, or threatens to leave.
2. OFF_TOPIC - Query is completely unrelated to finance, banking, loans, or credit cards (e.g. "how to cook pasta", "weather").
3. ANSWER - Query is about financial products, loans, credit cards, comparisons, greetings, or general financial help.

Output ONLY the category name (ESCALATE, OFF_TOPIC, or ANSWER).`,
      ],
      ['human', '{query}'],
    ]);

    const classificationChain = classificationPrompt.pipe(model).pipe(new StringOutputParser());
    const intent = (await classificationChain.invoke({ query: newMessage })).trim().toUpperCase();

    // Send escalation status first
    let isEscalation = false;

    if (intent.includes('ESCALATE')) {
      isEscalation = true;
      res.write(`data: ${JSON.stringify({ type: 'escalation', isEscalation: true })}\n\n`);

      const escalationMessage =
        'I understand your frustration. I have flagged this conversation for immediate human assistance. An agent will be with you shortly.';

      for await (const chunk of stringToStream(escalationMessage)) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      return res.end();
    }

    res.write(`data: ${JSON.stringify({ type: 'escalation', isEscalation: false })}\n\n`);

    if (intent.includes('OFF_TOPIC')) {
      const offTopicMessage =
        "I specialize in financial advice, credit cards, and loans. I can't really help with that topic, but I'd be happy to answer any banking questions you have!";

      for await (const chunk of stringToStream(offTopicMessage)) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
      return res.end();
    }

    // Step 2: Generate Answer with RAG
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

    const chatPrompt = ChatPromptTemplate.fromMessages([
      ['system', systemMessage],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
    ]);

    const chatHistory = convertToLangChainMessages(messages);
    const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());

    const stream = await chain.stream({
      chat_history: chatHistory,
      input: newMessage,
    });

    // Stream the response
    for await (const chunk of stream) {
      if (chunk) {
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat API Error:', error);

    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.write(
      `data: ${JSON.stringify({ type: 'error', message: 'An error occurred. Please try again.' })}\n\n`
    );
    res.end();
  }
}
