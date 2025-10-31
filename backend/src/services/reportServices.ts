// backend/src/services/reportServices.ts
// Financial Reports Business Logic

import { db } from '../utils/db';
import crypto from 'crypto';

/**
 * Generate Profit & Loss Statement
 */
export async function generateProfitLoss(
  userId: string,
  clientId: string | null,
  options: {
    startDate?: string;
    endDate?: string;
    period: string;
  }
) {
  const { startDate, endDate } = calculateDateRange(options.period, options.startDate, options.endDate);
  
  // Get revenue items
  const revenueItems = await db.query(`
    SELECT 
      category,
      description,
      SUM(amount) as amount
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = 'income'
      AND date >= ? AND date <= ?
    GROUP BY category, description
    ORDER BY amount DESC
  `, [userId, clientId, clientId, startDate, endDate]);
  
  const revenueTotal = revenueItems.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  // Get expense items by category
  const expenseItems = await db.query(`
    SELECT 
      category,
      description,
      SUM(amount) as amount
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = 'expense'
      AND date >= ? AND date <= ?
    GROUP BY category, description
    ORDER BY category, amount DESC
  `, [userId, clientId, clientId, startDate, endDate]);
  
  const expenseTotal = expenseItems.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  // Get prior period for comparison
  const priorPeriod = calculatePriorPeriod(startDate, endDate);
  const priorRevenue = await getTotalForPeriod(userId, clientId, 'income', priorPeriod.start, priorPeriod.end);
  const priorExpenses = await getTotalForPeriod(userId, clientId, 'expense', priorPeriod.start, priorPeriod.end);
  const priorNetIncome = priorRevenue - priorExpenses;
  
  const netIncome = revenueTotal - expenseTotal;
  
  // Group expenses by category
  const expenseCategories = groupByCategory(expenseItems);
  
  const reportId = crypto.randomUUID();
  
  // Store report
  await db.query(`
    INSERT INTO reports (
      id, user_id, client_id, type, period,
      start_date, end_date, data, generated_at
    )
    VALUES (?, ?, ?, 'profit_loss', ?, ?, ?, ?, datetime('now'))
  `, [
    reportId,
    userId,
    clientId,
    options.period,
    startDate,
    endDate,
    JSON.stringify({
      revenue: {
        items: revenueItems.map(formatLineItem),
        subtotal: revenueTotal
      },
      expenses: {
        items: expenseItems.map(formatLineItem),
        subtotal: expenseTotal,
        categories: expenseCategories
      },
      netIncome,
      comparison: {
        current: netIncome,
        previous: priorNetIncome,
        change: netIncome - priorNetIncome,
        changePercentage: priorNetIncome > 0 ? ((netIncome - priorNetIncome) / priorNetIncome) * 100 : 0
      }
    })
  ]);
  
  return {
    id: reportId,
    type: 'profit_loss',
    period: options.period,
    startDate,
    endDate,
    data: {
      revenue: {
        items: revenueItems.map(formatLineItem),
        subtotal: revenueTotal
      },
      expenses: {
        items: expenseItems.map(formatLineItem),
        subtotal: expenseTotal,
        categories: expenseCategories
      },
      netIncome,
      comparison: {
        current: netIncome,
        previous: priorNetIncome,
        change: netIncome - priorNetIncome,
        changePercentage: priorNetIncome > 0 ? ((netIncome - priorNetIncome) / priorNetIncome) * 100 : 0
      }
    }
  };
}

/**
 * Generate Balance Sheet
 */
export async function generateBalanceSheet(
  userId: string,
  clientId: string | null,
  options: {
    asOfDate: string;
  }
) {
  const asOfDate = options.asOfDate;
  
  // Get current assets (simplified - would need proper asset tracking)
  const cashBalance = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ?
      AND date <= ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId, asOfDate]);
  
  const cash = cashBalance[0]?.balance || 0;
  
  // Get accounts receivable (unpaid invoices if implemented)
  const accountsReceivable = 0; // TODO: Implement invoice tracking
  
  // Current liabilities (unpaid bills)
  const accountsPayable = 0; // TODO: Implement bill tracking
  
  const totalAssets = cash + accountsReceivable;
  const totalLiabilities = accountsPayable;
  const totalEquity = totalAssets - totalLiabilities;
  
  const reportId = crypto.randomUUID();
  
  const data = {
    assets: {
      current: [
        { id: crypto.randomUUID(), description: 'Cash', category: 'Current Assets', amount: cash },
        { id: crypto.randomUUID(), description: 'Accounts Receivable', category: 'Current Assets', amount: accountsReceivable }
      ],
      fixed: [],
      total: totalAssets
    },
    liabilities: {
      current: [
        { id: crypto.randomUUID(), description: 'Accounts Payable', category: 'Current Liabilities', amount: accountsPayable }
      ],
      longTerm: [],
      total: totalLiabilities
    },
    equity: {
      items: [
        { id: crypto.randomUUID(), description: 'Retained Earnings', category: 'Equity', amount: totalEquity }
      ],
      total: totalEquity
    },
    totalAssets,
    totalLiabilities,
    totalEquity
  };
  
  await db.query(`
    INSERT INTO reports (
      id, user_id, client_id, type, period,
      start_date, end_date, data, generated_at
    )
    VALUES (?, ?, ?, 'balance_sheet', 'as_of', ?, ?, ?, datetime('now'))
  `, [reportId, userId, clientId, asOfDate, asOfDate, JSON.stringify(data)]);
  
  return {
    id: reportId,
    type: 'balance_sheet',
    asOfDate,
    data
  };
}

/**
 * Generate Cash Flow Statement
 */
export async function generateCashFlowStatement(
  userId: string,
  clientId: string | null,
  options: {
    startDate?: string;
    endDate?: string;
    period: string;
  }
) {
  const { startDate, endDate } = calculateDateRange(options.period, options.startDate, options.endDate);
  
  // Operating activities
  const operating = await db.query(`
    SELECT 
      category,
      description,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as amount
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= ? AND date <= ?
      AND category NOT IN ('Investment', 'Financing', 'Asset Purchase')
    GROUP BY category, description
  `, [userId, clientId, clientId, startDate, endDate]);
  
  const operatingTotal = operating.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  // Investing activities (asset purchases, investments)
  const investing = await db.query(`
    SELECT 
      description,
      SUM(-amount) as amount
    FROM transactions
    WHERE user_id = ?
      AND date >= ? AND date <= ?
      AND category = 'Investment'
    GROUP BY description
  `, [userId, startDate, endDate]);
  
  const investingTotal = investing.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  // Financing activities (loans, equity)
  const financing = await db.query(`
    SELECT 
      description,
      SUM(amount) as amount
    FROM transactions
    WHERE user_id = ?
      AND date >= ? AND date <= ?
      AND category = 'Financing'
    GROUP BY description
  `, [userId, startDate, endDate]);
  
  const financingTotal = financing.reduce((sum: number, item: any) => sum + item.amount, 0);
  
  const netCashFlow = operatingTotal + investingTotal + financingTotal;
  
  // Get beginning and ending cash
  const beginningCash = await getCashBalanceAsOf(userId, startDate);
  const endingCash = beginningCash + netCashFlow;
  
  const reportId = crypto.randomUUID();
  
  const data = {
    operating: {
      items: operating.map(formatLineItem),
      subtotal: operatingTotal
    },
    investing: {
      items: investing.map(formatLineItem),
      subtotal: investingTotal
    },
    financing: {
      items: financing.map(formatLineItem),
      subtotal: financingTotal
    },
    netCashFlow,
    beginningCash,
    endingCash
  };
  
  await db.query(`
    INSERT INTO reports (
      id, user_id, client_id, type, period,
      start_date, end_date, data, generated_at
    )
    VALUES (?, ?, ?, 'cash_flow_statement', ?, ?, ?, ?, datetime('now'))
  `, [reportId, userId, clientId, options.period, startDate, endDate, JSON.stringify(data)]);
  
  return {
    id: reportId,
    type: 'cash_flow_statement',
    period: options.period,
    startDate,
    endDate,
    data
  };
}

/**
 * Generate KPI Dashboard Report
 */
export async function generateKPIDashboard(
  userId: string,
  clientId: string | null,
  options: {
    period: string;
  }
) {
  const { startDate, endDate } = calculateDateRange(options.period);
  
  // Get all key metrics
  const revenue = await getTotalForPeriod(userId, clientId, 'income', startDate, endDate);
  const expenses = await getTotalForPeriod(userId, clientId, 'expense', startDate, endDate);
  const profit = revenue - expenses;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
  
  // Calculate trends
  const priorPeriod = calculatePriorPeriod(startDate, endDate);
  const priorRevenue = await getTotalForPeriod(userId, clientId, 'income', priorPeriod.start, priorPeriod.end);
  const priorExpenses = await getTotalForPeriod(userId, clientId, 'expense', priorPeriod.start, priorPeriod.end);
  const priorProfit = priorRevenue - priorExpenses;
  
  const reportId = crypto.randomUUID();
  
  const data = {
    metrics: {
      revenue,
      expenses,
      profit,
      profitMargin
    },
    trends: {
      revenue: {
        current: revenue,
        previous: priorRevenue,
        change: revenue - priorRevenue,
        trend: revenue > priorRevenue ? 'up' : revenue < priorRevenue ? 'down' : 'stable'
      },
      expenses: {
        current: expenses,
        previous: priorExpenses,
        change: expenses - priorExpenses,
        trend: expenses > priorExpenses ? 'up' : expenses < priorExpenses ? 'down' : 'stable'
      },
      profit: {
        current: profit,
        previous: priorProfit,
        change: profit - priorProfit,
        trend: profit > priorProfit ? 'up' : profit < priorProfit ? 'down' : 'stable'
      }
    }
  };
  
  await db.query(`
    INSERT INTO reports (
      id, user_id, client_id, type, period,
      start_date, end_date, data, generated_at
    )
    VALUES (?, ?, ?, 'kpi_dashboard', ?, ?, ?, ?, datetime('now'))
  `, [reportId, userId, clientId, options.period, startDate, endDate, JSON.stringify(data)]);
  
  return {
    id: reportId,
    type: 'kpi_dashboard',
    period: options.period,
    startDate,
    endDate,
    data
  };
}

/**
 * Export report to different formats
 */
export async function exportReport(
  userId: string,
  clientId: string | null,
  reportId: string,
  format: string
) {
  const reports = await db.query(
    'SELECT * FROM reports WHERE id = ? AND user_id = ?',
    [reportId, userId]
  );
  
  if (!reports || reports.length === 0) {
    throw new Error('Report not found');
  }
  
  const report = reports[0];
  
  // TODO: Implement actual PDF/Excel generation
  // For now, return a placeholder URL
  const filename = `${report.type}_${report.start_date}_${report.end_date}.${format}`;
  const url = `/exports/${reportId}.${format}`;
  
  return {
    url,
    filename,
    format
  };
}

/**
 * Get report generation history
 */
export async function getReportHistory(
  userId: string,
  clientId: string | null,
  options: {
    type?: string;
    limit: number;
  }
) {
  let query = `
    SELECT id, type, period, start_date, end_date, generated_at
    FROM reports
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
  `;
  
  const params: any[] = [userId, clientId, clientId];
  
  if (options.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }
  
  query += ' ORDER BY generated_at DESC LIMIT ?';
  params.push(options.limit);
  
  return db.query(query, params);
}

// Helper functions

function calculateDateRange(period: string, startDate?: string, endDate?: string) {
  if (startDate && endDate) {
    return { startDate, endDate };
  }
  
  const end = new Date();
  let start = new Date();
  
  switch (period) {
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarterly':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'yearly':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setMonth(start.getMonth() - 1);
  }
  
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  };
}

function calculatePriorPeriod(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  const priorEnd = new Date(start);
  priorEnd.setDate(priorEnd.getDate() - 1);
  
  const priorStart = new Date(priorEnd);
  priorStart.setDate(priorStart.getDate() - days);
  
  return {
    start: priorStart.toISOString().split('T')[0],
    end: priorEnd.toISOString().split('T')[0]
  };
}

async function getTotalForPeriod(
  userId: string,
  clientId: string | null,
  type: string,
  startDate: string,
  endDate: string
) {
  const result = await db.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND type = ?
      AND date >= ? AND date <= ?
  `, [userId, clientId, clientId, type, startDate, endDate]);
  
  return result[0]?.total || 0;
}

async function getCashBalanceAsOf(userId: string, date: string) {
  const result = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ? AND date < ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId, date]);
  
  return result[0]?.balance || 0;
}

function formatLineItem(item: any) {
  return {
    id: crypto.randomUUID(),
    description: item.description || item.category,
    category: item.category,
    amount: item.amount,
    percentage: 0 // Calculate in context of total
  };
}

function groupByCategory(items: any[]) {
  const categories: any = {};
  
  items.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = {
        name: item.category,
        amount: 0,
        percentage: 0,
        items: []
      };
    }
    
    categories[item.category].amount += item.amount;
    categories[item.category].items.push(formatLineItem(item));
  });
  
  return Object.values(categories);
}
