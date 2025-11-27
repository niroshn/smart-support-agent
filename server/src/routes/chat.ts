import { Router, Request, Response } from 'express';
import { sendMessageToAgent } from '../services/aiService.js';
import { ChatRequest, Message } from '../types/index.js';

const router = Router();

// POST /api/chat - Handle chat messages with streaming response
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, newMessage } = req.body as ChatRequest;

    if (!newMessage || !messages) {
      return res.status(400).json({ error: 'Missing required fields: messages and newMessage' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Get streaming response from service
    const { stream, isEscalation } = await sendMessageToAgent(messages, newMessage, apiKey);

    // Send isEscalation flag first
    res.write(`data: ${JSON.stringify({ type: 'escalation', isEscalation })}\n\n`);

    // Stream the response chunks
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
    }

    // Send completion signal
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Chat endpoint error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Stream error occurred' })}\n\n`);
      res.end();
    }
  }
});

// GET /api/health - Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
