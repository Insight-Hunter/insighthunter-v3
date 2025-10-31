// shared/types/dashboard.ts
// Dashboard and KPI Types

export interface DashboardOverview {
  revenue: MetricWithChange;
  expenses: MetricWithChange;
  profit: MetricWithChange;
  cashFlow: MetricWithChange;
  period: number; // days
}

export interface MetricWithChange {
  current: number;
  previous?: number;
  change?: number; // percentage
  trend?: 'up' | 'down' | 'stable';
}

export interface KPIMetrics {
  revenue: number;
  expenses: number;
  profit: number;
  profitMargin: number; // percentage
  burnRate: number; // daily burn
  runway: number; // days
  avgDailyRevenue: number;
  cashBalance: number;
  operatingMargin?: number;
  quickRatio?: number;
}

export interface Alert {
  id: string;
  userId: string;
  clientId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  status: 'active' | 'dismissed' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

export enum AlertType {
  CASH_FLOW_WARNING = 'cash_flow_warning',
  REVENUE_DROP = 'revenue_drop',
  EXPENSE_SPIKE = 'expense_spike',
  RUNWAY_LOW = 'runway_low',
  GOAL_ACHIEVED = 'goal_achieved',
  ANOMALY_DETECTED = 'anomaly_detected',
  PAYMENT_DUE = 'payment_due'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface CashFlowDataPoint {
  date: string;
  income: number;
  expenses: number;
  net: number;
  cumulative: number;
  balance?: number;
}

export interface ChartData {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  fill?: boolean;
}
