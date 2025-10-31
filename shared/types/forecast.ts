// shared/types/forecast.ts
// Forecasting and Scenario Types

export interface Forecast {
  id: string;
  userId: string;
  clientId?: string;
  type: ForecastType;
  period: number; // days into future
  scenarios: ForecastScenario[];
  assumptions: ForecastAssumptions;
  createdAt: Date;
  updatedAt: Date;
}

export enum ForecastType {
  CASH_FLOW = 'cash_flow',
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  PROFIT = 'profit'
}

export interface ForecastScenario {
  type: ScenarioType;
  label: string;
  cashFlow: number;
  revenue: number;
  expenses: number;
  profit: number;
  confidence: number; // 0-100
  probability: number; // 0-100
  dataPoints?: ForecastDataPoint[];
}

export enum ScenarioType {
  BEST = 'best',
  BASE = 'base',
  WORST = 'worst',
  CUSTOM = 'custom'
}

export interface ForecastDataPoint {
  date: string;
  value: number;
  upperBound?: number;
  lowerBound?: number;
}

export interface ForecastAssumptions {
  revenueGrowth: number; // percentage
  expenseGrowth: number; // percentage
  seasonalityFactor: number;
  churnRate?: number;
  newCustomerRate?: number;
  avgTransactionValue?: number;
  customAssumptions?: Record<string, number>;
}

export interface ForecastMetrics {
  burnRate: number;
  runway: number; // days
  breakEven: {
    date?: string;
    revenue: number;
  };
  growthRate: number; // percentage
  projectedCashFlow: number;
}

export interface ScenarioComparison {
  best: ForecastScenario;
  base: ForecastScenario;
  worst: ForecastScenario;
  recommendedAction?: string;
}
