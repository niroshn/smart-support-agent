export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isEscalation?: boolean;
}

export interface FinancialProduct {
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

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  escalated: boolean;
}
