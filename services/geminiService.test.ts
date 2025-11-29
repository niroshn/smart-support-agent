import { sendMessageToAgent } from './geminiService';
import { Message } from '../types';

// Mock fetch
global.fetch = jest.fn();

describe('geminiService', () => {
  const mockMessages: Message[] = [
    {
      id: '1',
      role: 'user',
      content: 'Hello',
      timestamp: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendMessageToAgent', () => {
    it('should make POST request to correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"Hello"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await sendMessageToAgent(mockMessages, 'Test message');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: mockMessages,
            newMessage: 'Test message',
          }),
        })
      );
    });

    it('should return streaming response with isEscalation flag', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"Test"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      expect(result.isEscalation).toBe(false);
      expect(result.stream).toBeDefined();
    });

    it('should set isEscalation to true when escalation is triggered', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":true}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"Escalating"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'I want to speak to a human');

      expect(result.isEscalation).toBe(true);
    });

    it('should yield chunks from stream', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"Hello "}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"World"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello ', 'World']);
    });

    it('should handle HTTP errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      // Should return error stream
      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      expect(chunks[0]).toContain('connection issue');
      expect(result.isEscalation).toBe(false);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await sendMessageToAgent(mockMessages, 'Test');

      // Should return error stream
      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      expect(chunks[0]).toContain('connection issue');
      expect(result.isEscalation).toBe(false);
    });

    it('should handle missing response body', async () => {
      const mockResponse = {
        ok: true,
        body: null,
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      // Should return error stream
      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      expect(chunks[0]).toContain('connection issue');
    });

    it('should handle stream errors', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"error","message":"Stream error"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      await expect(async () => {
        for await (const _ of result.stream) {
          // Should throw error
        }
      }).rejects.toThrow('Stream error');
    });

    it('should handle malformed JSON in stream', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {invalid json}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      await expect(async () => {
        for await (const _ of result.stream) {
          // Should handle parse error
        }
      }).rejects.toThrow();
    });

    it('should handle empty message history', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"Response"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent([], 'First message');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({
            messages: [],
            newMessage: 'First message',
          }),
        })
      );

      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Response']);
    });

    it('should stop streaming when done event is received', async () => {
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"First"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"chunk","content":"After done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await sendMessageToAgent(mockMessages, 'Test');

      const chunks: string[] = [];
      for await (const chunk of result.stream) {
        chunks.push(chunk);
      }

      // Should not include chunks after 'done'
      expect(chunks).toEqual(['First']);
    });
  });

  describe('API URL Configuration', () => {
    it('should use VITE_API_URL from environment', () => {
      // The API URL is determined at import time, so we can't easily test this
      // without mocking import.meta.env, but we can verify fetch is called
      const mockResponse = {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"type":"escalation","isEscalation":false}\n\n'));
            controller.enqueue(encoder.encode('data: {"type":"done"}\n\n'));
            controller.close();
          },
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      sendMessageToAgent([], 'Test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/chat$/),
        expect.any(Object)
      );
    });
  });
});
