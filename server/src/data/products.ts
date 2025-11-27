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
