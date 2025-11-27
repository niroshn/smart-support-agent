export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isEscalation?: boolean;
}

export interface ChatRequest {
  messages: Message[];
  newMessage: string;
}

export interface StreamingResponse {
  stream: AsyncIterable<string>;
  isEscalation: boolean;
}
