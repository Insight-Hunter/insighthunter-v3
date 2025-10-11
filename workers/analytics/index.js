// workers/analytics/index.js
// Main entry point for the analytics Worker

import { authenticateRequest } from ‘./auth.js’;
import { getMonthlyData, getCategoryBreakdown } from ‘./data-aggregation.js’;
import { generateForecast, generateAllForecasts } from ‘./forecasting.js’;
import { detectSeasonality, applySeasonalAdjustment } from ‘./seasonality.js’;
import { generateInsights } from ‘./insights.js’;
import { detectAnomalies } from ‘./anomalies.js’;
import {
getCachedOrCompute,
getDashboardCacheKey,
getForecastCacheKey,
getInsightsCacheKey
} from ‘./cache.js’;
import { mean } from ‘simple-statistics’;

/**

- CORS headers for cross-origin requests
  */
  const CORS_HEADERS = {
  ‘Access-Control-Allow-Origin’: ’*’,
  ‘Access-Control-Allow-Methods’: ‘GET, POST, OPTIONS’,
  ‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’
  };

/**

- Handle CORS preflight requests
  */
  function handleOptions() {
  return new Response(null, {
  headers: CORS_HEADERS
  });
  }

/**

- Create error response
  */
  function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
  status,
  headers: {
  ‘Content-Type’: ‘application/json’,
  …CORS_HEADERS
  }
  });
  }

/**

- Create success response
  */
  function successResponse(data, fromCache = false) {
  return new Response(JSON.stringify({ success: true, …data }), {
  status: 200,
  headers: {
  ‘Content-Type’: ‘application/json’,
  ‘Cache-Control’: fromCache ? ‘public, max-age=1800’ : ‘no-cache’,
  …CORS_HEADERS
  }
  });
  }

/**

- Handle forecast endpoint
  */
  async function handleForecast(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get(‘client_id’);
  const timeRange = url.searchParams.get(‘time_range’) || ‘90days’;

// Determine months of historical data based on time range
const monthsMap = {
‘30days’: 3,
‘90days’: 6,
‘180days’: 12,
‘1year’: 12,
‘2years’: 24
};
const monthsBack = monthsMap[timeRange] || 6;

// Create cache key
const cacheKey = getForecastCacheKey(userId, clientId, timeRange);

// Try cache or compute
const result = await getCachedOrCompute(
env.CACHE,
cacheKey,
async () => {
// Get historical data
const monthlyData = await getMonthlyData(env.DB, userId, clientId, monthsBack);

```
  // Generate forecasts
  const forecasts = generateAllForecasts(monthlyData, 3);
  
  // Detect seasonality
  const seasonality = detectSeasonality(monthlyData, 'revenue');
  
  // Apply seasonal adjustment if patterns detected
  if (seasonality && forecasts.revenue.forecasts.length > 0) {
    const overallAvg = mean(monthlyData.map(d => d.revenue));
    forecasts.revenue.forecasts = applySeasonalAdjustment(
      forecasts.revenue.forecasts,
      seasonality,
      overallAvg
    );
  }
  
  return {
    historical: monthlyData,
    forecasts,
    seasonality,
    generatedAt: new Date().toISOString()
  };
},
1800 // Cache for 30 minutes
```

);

return successResponse(result, result.fromCache);
}

/**

- Handle insights endpoint
  */
  async function handleInsights(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get(‘client_id’);

const cacheKey = getInsightsCacheKey(userId, clientId);

const result = await getCachedOrCompute(
env.CACHE,
cacheKey,
async () => {
// Get data for insights
const monthlyData = await getMonthlyData(env.DB, userId, clientId, 6);
const categoryBreakdown = await getCategoryBreakdown(env.DB, userId, clientId, 3);

```
  // Generate forecasts for context
  const forecasts = generateAllForecasts(monthlyData, 3);
  
  // Detect anomalies
  const anomalies = await detectAnomalies(env.DB, userId, clientId, categoryBreakdown);
  
  // Generate AI insights
  const insights = await generateInsights(
    env.AI,
    monthlyData,
    forecasts,
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
```

);

return successResponse(result, result.fromCache);
}

/**

- Handle dashboard endpoint
  */
  async function handleDashboard(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get(‘client_id’);

const cacheKey = getDashboardCacheKey(userId, clientId);

const result = await getCachedOrCompute(
env.CACHE,
cacheKey,
async () => {
// Get all data in parallel
const [monthlyData, categoryBreakdown] = await Promise.all([
getMonthlyData(env.DB, userId, clientId, 12),
getCategoryBreakdown(env.DB, userId, clientId, 3)
]);

```
  // Generate forecast
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
```

);

return successResponse(result, result.fromCache);
}

/**

- Main Worker fetch handler
  */
  export default {
  async fetch(request, env) {
  const url = new URL(request.url);
  
  // Handle CORS preflight
  if (request.method === ‘OPTIONS’) {
  return handleOptions();
  }
  
  // Authenticate all requests
  const payload = await authenticateRequest(request, env.JWT_SECRET);
  
  if (!payload) {
  return errorResponse(‘Authentication required’, 401);
  }
  
  const userId = payload.userId;
  
  try {
  // Route to appropriate handler
  if (url.pathname === ‘/api/forecast’ && request.method === ‘GET’) {
  return await handleForecast(request, env, userId);
  }
  
  if (url.pathname === ‘/api/insights’ && request.method === ‘GET’) {
  return await handleInsights(request, env, userId);
  }
  
  if (url.pathname === ‘/api/dashboard’ && request.method === ‘GET’) {
  return await handleDashboard(request, env, userId);
  }
  
  // Route not found
  return errorResponse(‘Not found’, 404);
  
  } catch (error) {
  console.error(‘Worker error:’, error);
  return errorResponse(’Internal server error: ’ + error.message, 500);
  }
  }
  };

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
