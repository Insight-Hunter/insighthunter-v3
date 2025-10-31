// backend/src/services/analyticsServices.ts
// Analytics and Insights Business Logic

import { db } from '../utils/db';
import crypto from 'crypto';

/**
 * Get financial trends over time
 */
export async function getTrends(
  userId: string,
  clientId: string | null,
  options: {
    metric?: string;
    period: string;
  }
) {
  const days = parsePeriod(options.period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get daily aggregated data
  const dailyData = await db.query(`
    SELECT 
      DATE(date) as day,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= ?
    GROUP BY DATE(date)
    ORDER BY DATE(date) ASC
  `, [userId, clientId, clientId, startDate.toISOString().split('T')[0]]);
  
  // Calculate moving averages
  const trends = calculateMovingAverages(dailyData, 7);
  
  return {
    period: options.period,
    metric: options.metric || 'all',
    data: dailyData,
    trends,
    summary: {
      totalRevenue: dailyData.reduce((sum: number, d: any) => sum + d.revenue, 0),
      totalExpenses: dailyData.reduce((sum: number, d: any) => sum + d.expenses, 0),
      averageDailyRevenue: dailyData.length > 0 
        ? dailyData.reduce((sum: number, d: any) => sum + d.revenue, 0) / dailyData.length 
        : 0,
      averageDailyExpenses: dailyData.length > 0
        ? dailyData.reduce((sum: number, d: any) => sum + d.expenses, 0) / dailyData.length
        : 0
    }
  };
}

/**
 * Get customer/client revenue analysis
 */
export async function getCustomerAnalysis(
  userId: string,
  clientId: string | null,
  options: {
    period: string;
  }
) {
  const days = parsePeriod(options.period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get revenue by customer (from metadata or description)
  const customerRevenue = await db.query(`
    SELECT 
      COALESCE(JSON_EXTRACT(metadata, '$.customer'), 'Unknown') as customer,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_transaction,
      MAX(amount) as max_transaction,
      MIN(date) as first_transaction,
      MAX(date) as last_transaction
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = 'income'
      AND date >= ?
    GROUP BY customer
    ORDER BY total_revenue DESC
    LIMIT 20
  `, [userId, clientId, clientId, startDate.toISOString().split('T')[0]]);
  
  const totalRevenue = customerRevenue.reduce((sum: number, c: any) => sum + c.total_revenue, 0);
  
  return {
    period: options.period,
    customers: customerRevenue.map((c: any) => ({
      ...c,
      percentage: totalRevenue > 0 ? (c.total_revenue / totalRevenue) * 100 : 0
    })),
    summary: {
      totalCustomers: customerRevenue.length,
      totalRevenue,
      averageRevenuePerCustomer: customerRevenue.length > 0 
        ? totalRevenue / customerRevenue.length 
        : 0
    }
  };
}

/**
 * Get expense breakdown by category
 */
export async function getExpenseBreakdown(
  userId: string,
  clientId: string | null,
  options: {
    period: string;
    groupBy: string;
  }
) {
  const days = parsePeriod(options.period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Group by category
  const breakdown = await db.query(`
    SELECT 
      category,
      COUNT(*) as transaction_count,
      SUM(amount) as total_amount,
      AVG(amount) as avg_amount,
      MAX(amount) as max_amount,
      MIN(amount) as min_amount
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = 'expense'
      AND date >= ?
    GROUP BY category
    ORDER BY total_amount DESC
  `, [userId, clientId, clientId, startDate.toISOString().split('T')[0]]);
  
  const totalExpenses = breakdown.reduce((sum: number, b: any) => sum + b.total_amount, 0);
  
  // Calculate month-over-month for each category
  const priorStartDate = new Date(startDate);
  priorStartDate.setDate(priorStartDate.getDate() - days);
  
  for (const category of breakdown) {
    const priorAmount = await db.query(`
      SELECT SUM(amount) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND category = ?
        AND date >= ? AND date < ?
    `, [userId, category.category, priorStartDate.toISOString().split('T')[0], startDate.toISOString().split('T')[0]]);
    
    const prior = priorAmount[0]?.total || 0;
    category.change = category.total_amount - prior;
    category.changePercentage = prior > 0 ? ((category.total_amount - prior) / prior) * 100 : 0;
  }
  
  return {
    period: options.period,
    breakdown: breakdown.map((b: any) => ({
      ...b,
      percentage: totalExpenses > 0 ? (b.total_amount / totalExpenses) * 100 : 0
    })),
    summary: {
      totalExpenses,
      categoryCount: breakdown.length,
      topCategory: breakdown[0]?.category || 'N/A',
      topCategoryAmount: breakdown[0]?.total_amount || 0
    }
  };
}

/**
 * Get revenue analysis by source/product
 */
export async function getRevenueAnalysis(
  userId: string,
  clientId: string | null,
  options: {
    period: string;
    groupBy: string;
  }
) {
  const days = parsePeriod(options.period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const groupField = options.groupBy === 'source' ? 'category' : 'category';
  
  const analysis = await db.query(`
    SELECT 
      ${groupField} as source,
      COUNT(*) as transaction_count,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_revenue,
      MAX(amount) as max_revenue
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = 'income'
      AND date >= ?
    GROUP BY ${groupField}
    ORDER BY total_revenue DESC
  `, [userId, clientId, clientId, startDate.toISOString().split('T')[0]]);
  
  const totalRevenue = analysis.reduce((sum: number, a: any) => sum + a.total_revenue, 0);
  
  return {
    period: options.period,
    groupBy: options.groupBy,
    sources: analysis.map((a: any) => ({
      ...a,
      percentage: totalRevenue > 0 ? (a.total_revenue / totalRevenue) * 100 : 0
    })),
    summary: {
      totalRevenue,
      sourceCount: analysis.length,
      topSource: analysis[0]?.source || 'N/A',
      topSourceRevenue: analysis[0]?.total_revenue || 0
    }
  };
}

/**
 * Get industry benchmarks comparison
 */
export async function getBenchmarks(
  userId: string,
  clientId: string | null,
  options: {
    industry?: string;
  }
) {
  // Get user's metrics
  const userMetrics = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = ?
      AND date >= date('now', '-12 months')
  `, [userId]);
  
  const revenue = userMetrics[0]?.revenue || 0;
  const expenses = userMetrics[0]?.expenses || 0;
  const profitMargin = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0;
  
  // Industry benchmarks (hardcoded for now - would come from database)
  const industryBenchmarks: any = {
    'Consulting & Professional Services': {
      profitMargin: 20,
      revenueGrowth: 15,
      expenseRatio: 80
    },
    'Software & Technology': {
      profitMargin: 25,
      revenueGrowth: 30,
      expenseRatio: 75
    },
    'Retail': {
      profitMargin: 10,
      revenueGrowth: 10,
      expenseRatio: 90
    },
    'Default': {
      profitMargin: 15,
      revenueGrowth: 12,
      expenseRatio: 85
    }
  };
  
  const industry = options.industry || 'Default';
  const benchmarks = industryBenchmarks[industry] || industryBenchmarks['Default'];
  
  return {
    industry,
    userMetrics: {
      profitMargin,
      revenue,
      expenses,
      expenseRatio: revenue > 0 ? (expenses / revenue) * 100 : 0
    },
    benchmarks,
    comparison: {
      profitMargin: {
        user: profitMargin,
        industry: benchmarks.profitMargin,
        percentile: profitMargin > benchmarks.profitMargin ? 75 : 25
      },
      expenseRatio: {
        user: revenue > 0 ? (expenses / revenue) * 100 : 0,
        industry: benchmarks.expenseRatio,
        percentile: (expenses / revenue) * 100 < benchmarks.expenseRatio ? 75 : 25
      }
    }
  };
}

/**
 * Detect unusual patterns and anomalies using statistical analysis
 */
export async function detectAnomalies(
  userId: string,
  clientId: string | null,
  options: {
    period: string;
    sensitivity: string;
  }
) {
  const days = parsePeriod(options.period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Get all transactions
  const transactions = await db.query(`
    SELECT *
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= ?
    ORDER BY date ASC
  `, [userId, clientId, clientId, startDate.toISOString().split('T')[0]]);
  
  const anomalies: any[] = [];
  
  // Calculate statistics for expenses
  const expenses = transactions.filter((t: any) => t.type === 'expense');
  const expenseAmounts = expenses.map((t: any) => t.amount);
  
  if (expenseAmounts.length > 0) {
    const stats = calculateStatistics(expenseAmounts);
    const threshold = getAnomalyThreshold(options.sensitivity);
    
    // Detect outliers using z-score
    for (const txn of expenses) {
      const zScore = Math.abs((txn.amount - stats.mean) / stats.stdDev);
      
      if (zScore > threshold) {
        anomalies.push({
          id: txn.id,
          type: 'expense_outlier',
          severity: zScore > threshold * 1.5 ? 'high' : 'medium',
          transaction: txn,
          reason: `Expense ${zScore.toFixed(2)} standard deviations from average`,
          expectedRange: {
            min: stats.mean - (threshold * stats.stdDev),
            max: stats.mean + (threshold * stats.stdDev)
          }
        });
      }
    }
  }
  
  // Detect unusual patterns (same amount repeated)
  const amountCounts: any = {};
  transactions.forEach((t: any) => {
    const key = `${t.amount}_${t.category}`;
    amountCounts[key] = (amountCounts[key] || 0) + 1;
  });
  
  Object.keys(amountCounts).forEach(key => {
    if (amountCounts[key] >= 5) {
      const [amount, category] = key.split('_');
      anomalies.push({
        type: 'repeated_transaction',
        severity: 'low',
        reason: `Same amount ($${amount}) in category "${category}" repeated ${amountCounts[key]} times`,
        occurrences: amountCounts[key]
      });
    }
  });
  
  // Detect sudden spending spikes
  const dailyExpenses = await db.query(`
    SELECT 
      DATE(date) as day,
      SUM(amount) as total
    FROM transactions
    WHERE user_id = ?
      AND type = 'expense'
      AND date >= ?
    GROUP BY DATE(date)
    ORDER BY total DESC
    LIMIT 5
  `, [userId, startDate.toISOString().split('T')[0]]);
  
  const avgDailyExpense = expenses.length > 0
    ? expenses.reduce((sum: number, e: any) => sum + e.amount, 0) / days
    : 0;
  
  for (const day of dailyExpenses) {
    if (day.total > avgDailyExpense * 3) {
      anomalies.push({
        type: 'spending_spike',
        severity: 'medium',
        date: day.day,
        amount: day.total,
        reason: `Daily spending ${(day.total / avgDailyExpense).toFixed(1)}x higher than average`,
        average: avgDailyExpense
      });
    }
  }
  
  return {
    period: options.period,
    sensitivity: options.sensitivity,
    anomaliesFound: anomalies.length,
    anomalies,
    summary: {
      expenseOutliers: anomalies.filter(a => a.type === 'expense_outlier').length,
      repeatedTransactions: anomalies.filter(a => a.type === 'repeated_transaction').length,
      spendingSpikes: anomalies.filter(a => a.type === 'spending_spike').length
    }
  };
}

// Helper functions

/**
 * Parse period string to days
 */
function parsePeriod(period: string): number {
  const match = period.match(/(\d+)([dmy])/);
  if (!match) return 30;
  
  const [, value, unit] = match;
  const num = parseInt(value);
  
  switch (unit) {
    case 'd': return num;
    case 'm': return num * 30;
    case 'y': return num * 365;
    default: return 30;
  }
}

/**
 * Calculate moving averages
 */
function calculateMovingAverages(data: any[], window: number) {
  const result: any[] = [];
  
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = data.slice(start, i + 1);
    
    result.push({
      day: data[i].day,
      revenue: subset.reduce((sum: number, d: any) => sum + d.revenue, 0) / subset.length,
      expenses: subset.reduce((sum: number, d: any) => sum + d.expenses, 0) / subset.length,
      net: subset.reduce((sum: number, d: any) => sum + d.net, 0) / subset.length
    });
  }
  
  return result;
}

/**
 * Calculate statistics for anomaly detection
 */
function calculateStatistics(values: number[]) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    variance,
    stdDev,
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

/**
 * Get anomaly detection threshold based on sensitivity
 */
function getAnomalyThreshold(sensitivity: string): number {
  switch (sensitivity) {
    case 'low': return 3.5;
    case 'medium': return 2.5;
    case 'high': return 2.0;
    default: return 2.5;
  }
}
