// shared/types/analytics.ts
// Analytics and Insights Types

export interface TrendData {
  period: string;
  metric: string;
  data: DailyTrendPoint[];
  trends: DailyTrendPoint[];
  summary: TrendSummary;
}

export interface DailyTrendPoint {
  day: string;
  revenue: number;
  expenses: number;
  net: number;
}

export interface TrendSummary {
  totalRevenue: number;
  totalExpenses: number;
  averageDailyRevenue: number;
  averageDailyExpenses: number;
}

export interface CustomerAnalysis {
  period: string;
  customers: CustomerMetrics[];
  summary: CustomerSummary;
}

export interface CustomerMetrics {
  customer: string;
  transactionCount: number;
  totalRevenue: number;
  avgTransaction: number;
  maxTransaction: number;
  firstTransaction: string;
  lastTransaction: string;
  percentage: number;
}

export interface CustomerSummary {
  totalCustomers: number;
  totalRevenue: number;
  averageRevenuePerCustomer: number;
}

export interface ExpenseAnalysis {
  period: string;
  breakdown: ExpenseBreakdown[];
  summary: ExpenseSummary;
}

export interface ExpenseBreakdown {
  category: string;
  transactionCount: number;
  totalAmount: number;
  avgAmount: number;
  maxAmount: number;
  minAmount: number;
  percentage: number;
  change?: number;
  changePercentage?: number;
}

export interface ExpenseSummary {
  totalExpenses: number;
  categoryCount: number;
  topCategory: string;
  topCategoryAmount: number;
}

export interface RevenueAnalysis {
  period: string;
  groupBy: string;
  sources: RevenueSource[];
  summary: RevenueSummary;
}

export interface RevenueSource {
  source: string;
  transactionCount: number;
  totalRevenue: number;
  avgRevenue: number;
  maxRevenue: number;
  percentage: number;
}

export interface RevenueSummary {
  totalRevenue: number;
  sourceCount: number;
  topSource: string;
  topSourceRevenue: number;
}

export interface Benchmarks {
  industry: string;
  userMetrics: UserMetrics;
  benchmarks: IndustryBenchmarks;
  comparison: BenchmarkComparison;
}

export interface UserMetrics {
  profitMargin: number;
  revenue: number;
  expenses: number;
  expenseRatio: number;
}

export interface IndustryBenchmarks {
  profitMargin: number;
  revenueGrowth: number;
  expenseRatio: number;
}

export interface BenchmarkComparison {
  profitMargin: {
    user: number;
    industry: number;
    percentile: number;
  };
  expenseRatio: {
    user: number;
    industry: number;
    percentile: number;
  };
}

export interface AnomalyDetection {
  period: string;
  sensitivity: AnomalySensitivity;
  anomaliesFound: number;
  anomalies: Anomaly[];
  summary: AnomalySummary;
}

export enum AnomalySensitivity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Anomaly {
  id?: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  transaction?: any;
  reason: string;
  date?: string;
  amount?: number;
  expectedRange?: {
    min: number;
    max: number;
  };
  occurrences?: number;
  average?: number;
}

export enum AnomalyType {
  EXPENSE_OUTLIER = 'expense_outlier',
  REPEATED_TRANSACTION = 'repeated_transaction',
  SPENDING_SPIKE = 'spending_spike',
  INCOME_DROP = 'income_drop',
  UNUSUAL_PATTERN = 'unusual_pattern'
}

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface AnomalySummary {
  expenseOutliers: number;
  repeatedTransactions: number;
  spendingSpikes: number;
}

export interface GrowthMetrics {
  period: string;
  data: GrowthDataPoint[];
  summary: GrowthSummary;
}

export interface GrowthDataPoint {
  month: string;
  revenue: number;
  prevRevenue: number;
  growthRate: number;
}

export interface GrowthSummary {
  averageGrowthRate: number;
  highestGrowth: number;
  lowestGrowth: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AnalyticsFilters {
  period?: string;
  startDate?: string;
  endDate?: string;
  metric?: string;
  groupBy?: string;
  sensitivity?: AnomalySensitivity;
}
// workers/analytics/anomalies.js
// Detect unusual transactions and spending patterns

/**

- Detect financial anomalies in spending patterns
- @param {D1Database} db - The D1 database binding
- @param {number} userId - The user ID
- @param {number|null} clientId - Optional client ID
- @param {Array} categoryBreakdown - Current category breakdown
- @returns {Promise<Array>} Array of anomaly objects
  */
  export async function detectAnomalies(db: any, userId: any, clientId: any, categoryBreakdown: any) {
  const anomalies: any[] = [];

// Check for categories with unusually high spending this month
await checkCategorySpikes(db, userId, clientId, categoryBreakdown, anomalies);

// Check for unusual individual transactions
await checkUnusualTransactions(db, userId, clientId, anomalies);

// Sort by severity (high first)
anomalies.sort((a, b) => {
const severityOrder = { high: 0, medium: 1, low: 2 };
return severityOrder[a.severity] - severityOrder[b.severity];
});

return anomalies;
}

/**

- Check for category spending spikes
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {number|null} clientId - Client ID
- @param {Array} categoryBreakdown - Category breakdown
- @param {Array} anomalies - Array to push anomalies to
  */
  async function checkCategorySpikes(db: any, userId: any, clientId: any, categoryBreakdown: string | any[], anomalies: any[]) {
  // Check top 5 categories for unusual increases
  for (const category of categoryBreakdown.slice(0, 5)) {
  // Get historical average for this category (last 6 months, excluding current)
  const historicalQuery = `SELECT AVG(monthly_total) as avg_spending FROM ( SELECT  strftime('%Y-%m', date) as month, SUM(ABS(amount)) as monthly_total FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND category = ? AND date >= date('now', '-6 months') AND date < date('now', '-1 month') GROUP BY strftime('%Y-%m', date) )`;
  
  const bindings = clientId;
   [userId, clientId, category.category];
    function checkUnusualTransactions(db: any, userId: any, clientId: any, anomalies: any[]) {
      throw new Error("Function not implemented.");
    }

