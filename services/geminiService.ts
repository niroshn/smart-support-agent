import { Message } from "../types";

interface StreamingResponse {
  stream: AsyncIterable<string>;
  isEscalation: boolean;
}

// In production (Vercel), use relative URLs. In development, use localhost
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '' : 'http://localhost:3001');

// --- Main Service Function ---
export const sendMessageToAgent = async (
  currentHistory: Message[],
  newMessage: string
): Promise<StreamingResponse> => {
  try {
    // Call backend API with chat history and new message
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: currentHistory,
        newMessage: newMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if response is SSE (Server-Sent Events)
    if (!response.body) {
      throw new Error('No response body');
    }

    // Create async generator to parse SSE stream
    async function* parseSSEStream() {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentIsEscalation = false;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'escalation') {
                currentIsEscalation = data.isEscalation;
              } else if (data.type === 'chunk') {
                yield data.content;
              } else if (data.type === 'done') {
                return;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }

    // Parse the first event to get escalation status
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let firstChunk = '';
    let isEscalation = false;

    // Read until we get the escalation status
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      firstChunk += decoder.decode(value, { stream: true });

      if (firstChunk.includes('\n\n')) {
        const lines = firstChunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'escalation') {
              isEscalation = data.isEscalation;
              break;
            }
          }
        }
        break;
      }
    }

    // Create a new response with the remaining data
    const remainingStream = new ReadableStream({
      async start(controller) {
        // Push the remaining data from firstChunk
        const lines = firstChunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'chunk') {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          }
        }

        // Continue reading from the original reader
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              break;
            }
            controller.enqueue(value);
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });

    // Parse the stream
    async function* streamGenerator() {
      const streamReader = remainingStream.getReader();
      const streamDecoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await streamReader.read();

          if (done) break;

          buffer += streamDecoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                yield data.content;
              } else if (data.type === 'done') {
                return;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            }
          }
        }
      } finally {
        streamReader.releaseLock();
      }
    }

    return {
      stream: streamGenerator(),
      isEscalation: isEscalation,
    };

  } catch (error) {
    console.error("API Error:", error);

    // Fallback error stream
    async function* errorStream() {
      yield "I'm experiencing a temporary connection issue. Please try again.";
    }

    return {
      stream: errorStream(),
      isEscalation: false,
    };
  }
};