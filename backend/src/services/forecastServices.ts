// backend/src/services/forecastServices.ts
// Forecasting Business Logic

import { db } from '../utils/db';
import crypto from 'crypto';

/**
 * Generate forecast using AI/ML
 */
export async function generateForecast(
  userId: string,
  clientId: string | null,
  options: {
    type: string;
    period: number;
    assumptions?: any;
  }
) {
  // Get historical data
  const historicalData = await getHistoricalData(userId, clientId, 90);
  
  // Calculate base scenario
  const baseScenario = calculateBaseScenario(historicalData, options.period);
  const bestScenario = calculateBestScenario(baseScenario);
  const worstScenario = calculateWorstScenario(baseScenario);
  
  const forecastId = crypto.randomUUID();
  
  // Store forecast
  await db.query(`
    INSERT INTO forecasts (
      id, user_id, client_id, type, period, 
      scenarios, assumptions, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    forecastId,
    userId,
    clientId,
    options.type,
    options.period,
    JSON.stringify([bestScenario, baseScenario, worstScenario]),
    JSON.stringify(options.assumptions || {})
  ]);
  
  return {
    id: forecastId,
    type: options.type,
    period: options.period,
    scenarios: [bestScenario, baseScenario, worstScenario],
    assumptions: options.assumptions || {}
  };
}

/**
 * Get forecast scenarios
 */
export async function getScenarios(
  userId: string,
  clientId: string | null,
  options: { period: number; type: string }
) {
  const forecast = await generateForecast(userId, clientId, options);
  return forecast.scenarios;
}

/**
 * Update forecast assumptions and regenerate
 */
export async function updateAssumptions(
  userId: string,
  clientId: string | null,
  assumptions: any
) {
  return generateForecast(userId, clientId, {
    type: 'cash_flow',
    period: 60,
    assumptions
  });
}

/**
 * Get forecast metrics
 */
export async function getForecastMetrics(
  userId: string,
  clientId: string | null
) {
  // Get latest transactions
  const cashBalance = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId]);
  
  const balance = cashBalance[0]?.balance || 0;
  
  // Calculate burn rate (last 30 days)
  const expenses = await db.query(`
    SELECT SUM(amount) as total
    FROM transactions
    WHERE user_id = ?
      AND type = 'expense'
      AND date >= date('now', '-30 days')
  `, [userId]);
  
  const monthlyBurn = expenses[0]?.total || 0;
  const dailyBurn = monthlyBurn / 30;
  const runway = dailyBurn > 0 ? Math.floor(balance / dailyBurn) : Infinity;
  
  // Calculate growth rate
  const growth = await db.query(`
    SELECT 
      SUM(CASE WHEN date >= date('now', '-30 days') THEN amount ELSE 0 END) as current,
      SUM(CASE WHEN date >= date('now', '-60 days') AND date < date('now', '-30 days') THEN amount ELSE 0 END) as previous
    FROM transactions
    WHERE user_id = ? AND type = 'income'
  `, [userId]);
  
  const currentRevenue = growth[0]?.current || 0;
  const previousRevenue = growth[0]?.previous || 0;
  const growthRate = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  return {
    burnRate: dailyBurn,
    runway,
    growthRate,
    breakEven: {
      revenue: monthlyBurn,
      date: runway > 0 ? null : 'N/A'
    },
    projectedCashFlow: balance - (dailyBurn * 30)
  };
}

/**
 * Compare forecast scenarios
 */
export async function compareForecast(
  userId: string,
  clientId: string | null,
  scenarios: any[]
) {
  return {
    best: scenarios[0],
    base: scenarios[1],
    worst: scenarios[2],
    recommendedAction: generateRecommendation(scenarios)
  };
}

// Helper functions

function getHistoricalData(userId: string, clientId: string | null, days: number) {
  return db.query(`
    SELECT date, type, amount
    FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= date('now', '-' || ? || ' days')
    ORDER BY date ASC
  `, [userId, clientId, clientId, days]);
}

function calculateBaseScenario(historicalData: any[], period: number) {
  const dailyAverages = calculateDailyAverages(historicalData);
  
  return {
    type: 'base',
    label: 'Base Case',
    cashFlow: dailyAverages.netCashFlow * period,
    revenue: dailyAverages.income * period,
    expenses: dailyAverages.expenses * period,
    profit: (dailyAverages.income - dailyAverages.expenses) * period,
    confidence: 75,
    probability: 60,
    dataPoints: generateDataPoints(dailyAverages, period)
  };
}

function calculateBestScenario(baseScenario: any) {
  return {
    type: 'best',
    label: 'Best Case',
    cashFlow: baseScenario.cashFlow * 1.3,
    revenue: baseScenario.revenue * 1.3,
    expenses: baseScenario.expenses * 0.9,
    profit: baseScenario.profit * 1.5,
    confidence: 60,
    probability: 20
  };
}

function calculateWorstScenario(baseScenario: any) {
  return {
    type: 'worst',
    label: 'Worst Case',
    cashFlow: baseScenario.cashFlow * 0.7,
    revenue: baseScenario.revenue * 0.7,
    expenses: baseScenario.expenses * 1.1,
    profit: baseScenario.profit * 0.5,
    confidence: 85,
    probability: 20
  };
}

function calculateDailyAverages(data: any[]) {
  const income = data.filter(t => t.type === 'income');
  const expenses = data.filter(t => t.type === 'expense');
  
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const days = data.length > 0 ? Math.max(data.length / 2, 1) : 1;
  
  return {
    income: totalIncome / days,
    expenses: totalExpenses / days,
    netCashFlow: (totalIncome - totalExpenses) / days
  };
}

function generateDataPoints(averages: any, period: number) {
  const dataPoints = [];
  for (let i = 0; i < period; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dataPoints.push({
      date: date.toISOString().split('T')[0],
      value: averages.netCashFlow * i,
      upperBound: averages.netCashFlow * i * 1.2,
      lowerBound: averages.netCashFlow * i * 0.8
    });
  }
  return dataPoints;
}

function generateRecommendation(scenarios: any[]) {
  const base = scenarios[1];
  if (base.cashFlow < 0) {
    return 'Focus on reducing expenses or increasing revenue to improve cash flow';
  } else if (base.growthRate > 20) {
    return 'Strong growth trajectory - consider scaling operations';
  } else {
    return 'Maintain current strategy while exploring growth opportunities';
  }
}
