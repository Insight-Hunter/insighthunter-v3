// backend/src/services/dashboardServices.ts
// Dashboard Business Logic

import { db } from '../utils/db';

/**
 * Get dashboard overview with key metrics
 */
export async function getDashboardOverview(userId: string, clientId: string | null, period: string) {
  const days = parsePeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get revenue
  const revenue = await db.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE user_id = ? 
      AND (client_id = ? OR ? IS NULL)
      AND type = 'income'
      AND date >= ?
  `, [userId, clientId, clientId, startDate]);

  // Get expenses
  const expenses = await db.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE user_id = ? 
      AND (client_id = ? OR ? IS NULL)
      AND type = 'expense'
      AND date >= ?
  `, [userId, clientId, clientId, startDate]);

  // Calculate metrics
  const revenueTotal = revenue[0]?.total || 0;
  const expensesTotal = expenses[0]?.total || 0;
  const profit = revenueTotal - expensesTotal;
  const profitMargin = revenueTotal > 0 ? (profit / revenueTotal) * 100 : 0;

  // Get prior period for comparison
  const priorStartDate = new Date(startDate);
  priorStartDate.setDate(priorStartDate.getDate() - days);
  
  const priorRevenue = await db.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE user_id = ? 
      AND type = 'income'
      AND date >= ? AND date < ?
  `, [userId, priorStartDate, startDate]);

  const priorRevenueTotal = priorRevenue[0]?.total || 0;
  const revenueChange = priorRevenueTotal > 0 
    ? ((revenueTotal - priorRevenueTotal) / priorRevenueTotal) * 100 
    : 0;

  return {
    revenue: {
      current: revenueTotal,
      change: revenueChange,
      period: days
    },
    expenses: {
      current: expensesTotal,
      period: days
    },
    profit: {
      current: profit,
      margin: profitMargin,
      period: days
    },
    cashFlow: {
      current: profit, // Simplified - actual cash flow needs more complex calculation
      period: days
    }
  };
}

/**
 * Get key performance indicators
 */
export async function getKPIs(userId: string, clientId: string | null, period: string) {
  const days = parsePeriod(period);
  const overview = await getDashboardOverview(userId, clientId, period);

  // Calculate additional KPIs
  const burnRate = Math.abs(overview.expenses.current / days);
  const avgDailyRevenue = overview.revenue.current / days;
  
  // Get cash balance (from last transaction balance)
  const cashBalance = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId]);

  const balance = cashBalance[0]?.balance || 0;
  const runway = burnRate > 0 ? Math.floor(balance / burnRate) : Infinity;

  return {
    revenue: overview.revenue.current,
    expenses: overview.expenses.current,
    profit: overview.profit.current,
    profitMargin: overview.profit.margin,
    burnRate: burnRate,
    runway: runway,
    avgDailyRevenue: avgDailyRevenue,
    cashBalance: balance
  };
}

/**
 * Get active alerts for user
 */
export async function getAlerts(userId: string, clientId: string | null) {
  // Fetch from alerts table
  const alerts = await db.query(`
    SELECT * FROM alerts
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND status = 'active'
    ORDER BY priority DESC, created_at DESC
    LIMIT 10
  `, [userId, clientId, clientId]);

  return alerts;
}

/**
 * Get cash flow trend data
 */
export async function getCashFlow(userId: string, clientId: string | null, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get daily aggregated transactions
  const transactions = await db.query(`
    SELECT 
      DATE(date) as date,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= ?
    GROUP BY DATE(date)
    ORDER BY date ASC
  `, [userId, clientId, clientId, startDate]);

  // Calculate cumulative cash flow
  let cumulative = 0;
  const cashFlowData = transactions.map((row: any) => {
    const net = row.income - row.expenses;
    cumulative += net;
    
    return {
      date: row.date,
      income: row.income,
      expenses: row.expenses,
      net: net,
      cumulative: cumulative
    };
  });

  return cashFlowData;
}

/**
 * Helper function to parse period string to days
 */
function parsePeriod(period: string): number {
  const match = period.match(/(\d+)([dmy])/);
  if (!match) return 30; // Default to 30 days

  const [, value, unit] = match;
  const num = parseInt(value);

  switch (unit) {
    case 'd': return num;
    case 'm': return num * 30;
    case 'y': return num * 365;
    default: return 30;
  }
}
