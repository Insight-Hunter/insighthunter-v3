// workers/analytics/index.js
// Complete analytics and forecasting Worker for Insight Hunter
// Generates forecasts, insights, and financial intelligence

import { linearRegression, mean, standardDeviation } from ‘simple-statistics’;

// ============================================================================
// SHARED UTILITIES
// These would normally be imported from your shared directory
// ============================================================================

async function verifyJWT(token, secret) {
try {
const [headerB64, payloadB64, signatureB64] = token.split(’.’);
const encoder = new TextEncoder();
const data = encoder.encode(`${headerB64}.${payloadB64}`);

```
const secretKey = await crypto.subtle.importKey(
  'raw',
  encoder.encode(secret),
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['verify']
);

const signatureBytes = Uint8Array.from(
  atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')), 
  c => c.charCodeAt(0)
);

const isValid = await crypto.subtle.verify('HMAC', secretKey, signatureBytes, data);
if (!isValid) return null;

const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
if (payload.exp < Math.floor(Date.now() / 1000)) return null;

return payload;
```

} catch (error) {
return null;
}
}

// ============================================================================
// DATA AGGREGATION
// Query and aggregate transaction data for analysis
// ============================================================================

async function getMonthlyData(db, userId, clientId, monthsBack = 12) {
// Calculate the date range
const endDate = new Date();
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - monthsBack);

// Query transactions grouped by month
const query = `SELECT  strftime('%Y-%m', date) as month, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as revenue, SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses, COUNT(*) as transaction_count FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= ? AND date <= ? GROUP BY strftime('%Y-%m', date) ORDER BY month ASC`;

const bindings = clientId
? [userId, clientId, startDate.toISOString().split(‘T’)[0], endDate.toISOString().split(‘T’)[0]]
: [userId, startDate.toISOString().split(‘T’)[0], endDate.toISOString().split(‘T’)[0]];

const result = await db.prepare(query).bind(…bindings).all();

// Fill in missing months with zero values
const monthlyData = [];
const current = new Date(startDate);

while (current <= endDate) {
const monthKey = current.toISOString().substring(0, 7);
const existingData = result.results.find(r => r.month === monthKey);

```
monthlyData.push({
  month: monthKey,
  revenue: existingData ? existingData.revenue : 0,
  expenses: existingData ? existingData.expenses : 0,
  profit: existingData ? (existingData.revenue - existingData.expenses) : 0,
  transactionCount: existingData ? existingData.transaction_count : 0
});

current.setMonth(current.getMonth() + 1);
```

}

return monthlyData;
}

async function getCategoryBreakdown(db, userId, clientId, months = 3) {
const startDate = new Date();
startDate.setMonth(startDate.getMonth() - months);

const query = `SELECT  category, SUM(ABS(amount)) as total, COUNT(*) as count, AVG(ABS(amount)) as average FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= ? AND amount < 0 AND category IS NOT NULL AND category != 'Uncategorized' GROUP BY category ORDER BY total DESC LIMIT 15`;

const bindings = clientId
? [userId, clientId, startDate.toISOString().split(‘T’)[0]]
: [userId, startDate.toISOString().split(‘T’)[0]];

const result = await db.prepare(query).bind(…bindings).all();
return result.results;
}



// ============================================================================
// ANOMALY DETECTION
// Identify unusual transactions or patterns
// ============================================================================

async function detectAnomalies(db, userId, clientId, categoryBreakdown) {
const anomalies = [];

// Check for categories with unusually high spending this month
for (const category of categoryBreakdown.slice(0, 5)) {
// Get historical average for this category
const historicalQuery = `SELECT AVG(monthly_total) as avg_spending FROM ( SELECT  strftime('%Y-%m', date) as month, SUM(ABS(amount)) as monthly_total FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND category = ? AND date >= date('now', '-6 months') AND date < date('now', '-1 month') GROUP BY strftime('%Y-%m', date) )`;

```
const bindings = clientId
  ? [userId, clientId, category.category]
  : [userId, category.category];

const historical = await db.prepare(historicalQuery).bind(...bindings).first();

if (historical && historical.avg_spending) {
  const percentIncrease = ((category.total - historical.avg_spending) / historical.avg_spending) * 100;
  
  if (percentIncrease > 50) {
    anomalies.push({
      type: 'expense_spike',
      category: category.category,
      current: category.total,
      historical: historical.avg_spending,
      percentIncrease: Math.round(percentIncrease),
      severity: percentIncrease > 100 ? 'high' : 'medium',
      message: `${category.category} spending is ${Math.round(percentIncrease)}% higher than average`
    });
  }
}
```

}

// Check for unusual individual transactions
const unusualQuery = `SELECT * FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= date('now', '-30 days') AND ABS(amount) > ( SELECT AVG(ABS(amount)) * 3 FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} ) ORDER BY ABS(amount) DESC LIMIT 5`;

const unusualBindings = clientId
? [userId, clientId, userId, clientId]
: [userId, userId];

const unusualTx = await db.prepare(unusualQuery).bind(…unusualBindings).all();

for (const tx of unusualTx.results) {
anomalies.push({
type: ‘unusual_transaction’,
transactionId: tx.id,
amount: tx.amount,
description: tx.description,
date: tx.date,
severity: Math.abs(tx.amount) > 10000 ? ‘high’ : ‘medium’,
message: `Unusually large transaction: ${tx.description} ($${Math.abs(tx.amount).toFixed(2)})`
});
}

return anomalies;
}

// ============================================================================
// CACHING
// Use KV to cache expensive calculations
// ============================================================================

async function getCachedOrCompute(cache, key, computeFn, ttl = 3600) {
// Try to get from cache first
const cached = await cache.get(key, ‘json’);

if (cached) {
return { …cached, fromCache: true };
}

// Not in cache, compute it
const result = await computeFn();

// Store in cache with TTL (time to live in seconds)
await cache.put(key, JSON.stringify(result), {
expirationTtl: ttl
});

return { …result, fromCache: false };
}

// ============================================================================
// MAIN WORKER HANDLER
// Process incoming requests
// ============================================================================

export default {
async fetch(request, env) {
const url = new URL(request.url);

```
// Handle CORS
if (request.method === 'OPTIONS') {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// Authenticate all requests
const authHeader = request.headers.get('Authorization');
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return new Response(JSON.stringify({ error: 'Authentication required' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

const token = authHeader.substring(7);
const payload = await verifyJWT(token, env.JWT_SECRET);

if (!payload) {
  return new Response(JSON.stringify({ error: 'Invalid token' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}

const userId = payload.userId;

// ========================================================================
// FORECAST ENDPOINT
// GET /api/forecast
// ========================================================================

if (url.pathname === '/api/forecast' && request.method === 'GET') {
  try {
    const params = url.searchParams;
    const clientId = params.get('client_id');
    const timeRange = params.get('time_range') || '90days';
    
    // Determine months of historical data based on time range
    const monthsMap = {
      '30days': 3,
      '90days': 6,
      '180days': 12,
      '1year': 12,
      '2years': 24
    };
    const monthsBack = monthsMap[timeRange] || 6;
    
    // Create a cache key
    const cacheKey = `forecast:${userId}:${clientId || 'none'}:${timeRange}`;
    
    // Try to get from cache or compute
    const result = await getCachedOrCompute(
      env.CACHE,
      cacheKey,
      async () => {
        // Get historical data
        const monthlyData = await getMonthlyData(env.DB, userId, clientId, monthsBack);
        
        // Generate forecasts for revenue, expenses, and profit
        const revenueForecast = generateForecast(monthlyData, 3, 'revenue');
        const expenseForecast = generateForecast(monthlyData, 3, 'expenses');
        const profitForecast = generateForecast(monthlyData, 3, 'profit');
        
        // Detect seasonality
        const seasonality = detectSeasonality(monthlyData, 'revenue');
        
        return {
          historical: monthlyData,
          forecasts: {
            revenue: revenueForecast,
            expenses: expenseForecast,
            profit: profitForecast
          },
          seasonality: seasonality,
          generatedAt: new Date().toISOString()
        };
      },
      1800 // Cache for 30 minutes
    );
    
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': result.fromCache ? 'public, max-age=1800' : 'no-cache'
      }
    });
    
  } catch (error) {
    console.error('Forecast error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate forecast',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ========================================================================
// INSIGHTS ENDPOINT
// GET /api/insights
// ========================================================================

if (url.pathname === '/api/insights' && request.method === 'GET') {
  try {
    const params = url.searchParams;
    const clientId = params.get('client_id');
    
    const cacheKey = `insights:${userId}:${clientId || 'none'}`;
    
    const result = await getCachedOrCompute(
      env.CACHE,
      cacheKey,
      async () => {
        // Get data for insights
        const monthlyData = await getMonthlyData(env.DB, userId, clientId, 6);
        const categoryBreakdown = await getCategoryBreakdown(env.DB, userId, clientId, 3);
        
        // Generate forecasts for context
        const revenueForecast = generateForecast(monthlyData, 3, 'revenue');
        const expenseForecast = generateForecast(monthlyData, 3, 'expenses');
        
        // Detect anomalies
        const anomalies = await detectAnomalies(env.DB, userId, clientId, categoryBreakdown);
        
        // Generate AI insights
        const insights = await generateInsights(
          env.AI,
          monthlyData,
          { revenue: revenueForecast, expenses: expenseForecast },
          categoryBreakdown
        );
        
        return {
          insights,
          anomalies,
          categoryBreakdown,
          generatedAt: new Date().toISOString()
        };
      },
      3600 // Cache for 1 hour
    );
    
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Insights error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate insights',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ========================================================================
// DASHBOARD ENDPOINT
// GET /api/dashboard
// Returns everything needed for the main dashboard
// ========================================================================

if (url.pathname === '/api/dashboard' && request.method === 'GET') {
  try {
    const params = url.searchParams;
    const clientId = params.get('client_id');
    
    const cacheKey = `dashboard:${userId}:${clientId || 'none'}`;
    
    const result = await getCachedOrCompute(
      env.CACHE,
      cacheKey,
      async () => {
        // Get all data in parallel for efficiency
        const [monthlyData, categoryBreakdown] = await Promise.all([
          getMonthlyData(env.DB, userId, clientId, 12),
          getCategoryBreakdown(env.DB, userId, clientId, 3)
        ]);
        
        // Generate forecasts
        const revenueForecast = generateForecast(monthlyData, 3, 'revenue');
        
        // Calculate KPIs from recent data
        const recentData = monthlyData.slice(-3);
        const currentMonth = recentData[recentData.length - 1];
        const previousMonth = recentData[recentData.length - 2];
        
        const kpis = {
          monthlyRevenue: currentMonth.revenue,
          monthlyExpenses: currentMonth.expenses,
          netProfit: currentMonth.profit,
          profitMargin: currentMonth.revenue > 0 
            ? ((currentMonth.profit / currentMonth.revenue) * 100).toFixed(1)
            : 0,
          revenueChange: previousMonth.revenue > 0
            ? (((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100).toFixed(1)
            : 0
        };
        
        return {
          kpis,
          monthlyTrend: monthlyData.slice(-6),
          forecast: revenueForecast,
          categoryBreakdown: categoryBreakdown.slice(0, 10),
          generatedAt: new Date().toISOString()
        };
      },
      900 // Cache for 15 minutes
    );
    
    return new Response(JSON.stringify({
      success: true,
      ...result
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to generate dashboard data',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Default 404 response
return new Response(JSON.stringify({
  error: 'Not found',
  path: url.pathname
}), {
  status: 404,
  headers: { 'Content-Type': 'application/json' }
});
```

}
};
