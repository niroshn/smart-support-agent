import { FinancialProduct } from '../types';

export const KNOWLEDGE_BASE: FinancialProduct[] = [
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

export const getSystemPrompt = () => {
  const productContext = JSON.stringify(KNOWLEDGE_BASE, null, 2);
  
  return `
You are the MoneyHero AI Support Agent. Your goal is to assist users with financial products (credit cards, loans) using the provided Knowledge Base.

**Knowledge Base (Product Data):**
${productContext}

**Instructions:**
1. **RAG/Retrieval**: When asked about products, ONLY use the information in the Knowledge Base above. Do not hallucinate features or rates. If a product isn't listed, state that you don't have information on it.
2. **Tone**: Professional, helpful, and concise. Money matters are serious but shouldn't be boring.
3. **Intent Routing**:
   - **Product Questions**: Answer directly using the Knowledge Base.
   - **Comparisons**: You can compare products from the Knowledge Base if asked.
   - **Off-topic**: If the user asks about non-financial topics (e.g., cooking, coding, weather), polite decline and steer back to finance.
   - **Escalation**: If the user asks to speak to a human, is angry, or expresses frustration ("this is useless", "I need a person"), you MUST trigger an escalation.

**Escalation Protocol:**
If an escalation is needed, your response MUST strictly be a JSON object in this format (and nothing else):
{"action": "ESCALATE", "reason": "User request"}

Otherwise, respond normally in plain text (Markdown supported).
`;
};
