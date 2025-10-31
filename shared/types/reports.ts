// shared/types/reports.ts
// Financial Reports Types

export interface Report {
  id: string;
  userId: string;
  clientId?: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: string;
  endDate: string;
  data: ReportData;
  generatedAt: Date;
  format?: ReportFormat;
}

export enum ReportType {
  PROFIT_LOSS = 'profit_loss',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW_STATEMENT = 'cash_flow_statement',
  KPI_DASHBOARD = 'kpi_dashboard',
  CUSTOM = 'custom'
}

export enum ReportPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}

export type ReportData = 
  | ProfitLossData 
  | BalanceSheetData 
  | CashFlowStatementData 
  | KPIData;

export interface ProfitLossData {
  revenue: RevenueSection;
  expenses: ExpenseSection;
  netIncome: number;
  comparison?: PeriodComparison;
}

export interface RevenueSection {
  items: LineItem[];
  subtotal: number;
}

export interface ExpenseSection {
  items: LineItem[];
  subtotal: number;
  categories?: ExpenseCategory[];
}

export interface LineItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  percentage?: number;
}

export interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  items: LineItem[];
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface BalanceSheetData {
  assets: AssetsSection;
  liabilities: LiabilitiesSection;
  equity: EquitySection;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface AssetsSection {
  current: LineItem[];
  fixed: LineItem[];
  total: number;
}

export interface LiabilitiesSection {
  current: LineItem[];
  longTerm: LineItem[];
  total: number;
}

export interface EquitySection {
  items: LineItem[];
  total: number;
}

export interface CashFlowStatementData {
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
}

export interface CashFlowSection {
  items: LineItem[];
  subtotal: number;
}

export interface KPIData {
  metrics: Record<string, number>;
  trends: Record<string, TrendData>;
  benchmarks?: Record<string, BenchmarkData>;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

export interface BenchmarkData {
  value: number;
  industry: number;
  percentile: number;
}
