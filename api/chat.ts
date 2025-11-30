import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ChatAnthropic } from '@langchain/anthropic';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isEscalation?: boolean;
}

interface FinancialProduct {
  id: string;
  name: string;
  type: 'Credit Card' | 'Personal Loan';
  features: string[];
  fees: {
    annual?: string;
    processing?: string;
  };
  interestRate: string;
  eligibility: string;
  description: string;
}

// Static knowledge base
const KNOWLEDGE_BASE: FinancialProduct[] = [
  {
    id: 'cc-001',
    name: 'MoneyHero CashBack Plus',
    type: 'Credit Card',
    features: ['5% cashback on groceries', '2% on dining', 'Unlimited 1% on everything else', 'Free travel insurance'],
    fees: {
      annual: 'No annual fee for the first year, then $150',
    },
    interestRate: '25.9% APR',
    eligibility: 'Min. income $30,000/year, Age 21+',
    description: 'The best everyday card for families looking to save on daily essentials.',
  },
  {
    id: 'cc-002',
    name: 'TravelElite Platinum',
    type: 'Credit Card',
    features: ['Unlimited lounge access', 'No foreign transaction fees', 'Earn 3 miles per $1 spent locally'],
    fees: {
      annual: '$550 (non-waivable)',
    },
    interestRate: '28.5% APR',
    eligibility: 'Min. income $80,000/year, Age 21+',
    description: 'Premium travel companion for frequent flyers seeking luxury perks.',
  },
  {
    id: 'pl-001',
    name: 'QuickCash Personal Loan',
    type: 'Personal Loan',
    features: ['Approval in 15 minutes', 'Flexible tenure 1-5 years', 'No early repayment penalty'],
    fees: {
      processing: '1% of loan amount',
    },
    interestRate: '3.88% p.a. (EIR 7.5% p.a.)',
    eligibility: 'Citizens and PRs only, Age 21-65',
    description: 'Fast liquidity for emergencies or big ticket purchases with competitive rates.',
  },
  {
    id: 'pl-002',
    name: 'DebtConsolidation Saver',
    type: 'Personal Loan',
    features: ['Direct payment to other banks', 'Lower specific interest rate', 'Single monthly payment'],
    fees: {
      processing: '$0',
    },
    interestRate: '2.5% p.a. (EIR 5.2% p.a.)',
    eligibility: 'Existing debt > 12x monthly income',
    description: 'Simplify your finances by combining multiple debts into one manageable repayment plan.',
  }
];

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

// Format products for context
function formatProductContext(): string {
  return KNOWLEDGE_BASE.map((p) => {
    const fees = Object.entries(p.fees)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    return `Product: ${p.name}
Type: ${p.type}
Description: ${p.description}
Features: ${p.features.join(', ')}
Fees: ${fees}
Interest Rate: ${p.interestRate}
Eligibility: ${p.eligibility}`;
  }).join('\n\n---\n\n');
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

    // Step 2: Generate Answer with static knowledge base
    const productContext = formatProductContext();

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
