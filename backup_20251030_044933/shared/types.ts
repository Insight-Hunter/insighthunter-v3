// Shared TypeScript types

export interface User {
  id: string;
  email: string;
  name: string;
  company_name: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact_person: string;
  email: string;
  status: 'active' | 'trial' | 'inactive';
  mrr: number;
}

export interface Transaction {
  id: string;
  client_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  receipt_url?: string;
}

export interface CashFlowData {
  currentBalance: number;
  runway: { days: number; status: string };
  burnRate: { daily: number; weekly: number; monthly: number };
  projections: Record<string, number>;
}
