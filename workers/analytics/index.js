// workers/analytics/index.js
import { authenticateRequest } from "./auth.js";
import { getMonthlyData, getCategoryBreakdown } from "./data-aggregation.js";
import { generateForecast, generateAllForecasts } from "./forecasting.js";
import { detectSeasonality, applySeasonalAdjustment } from "./seasonality.js";
import { generateInsights } from "./insights.js";
import { detectAnomalies } from "./anomalies.js";
import {
  getCachedOrCompute,
  getDashboardCacheKey,
  getForecastCacheKey,
  getInsightsCacheKey
} from "./cache.js";
import { mean } from "simple-statistics";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function handleOptions() {
  return new Response(null, {
    headers: CORS_HEADERS
  });
}

function errorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    }
  });
}

function successResponse(data, fromCache = false) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": fromCache ? "public, max-age=1800" : "no-cache",
      ...CORS_HEADERS
    }
  });
}

async function handleForecast(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const timeRange = url.searchParams.get("time_range") || "90days";

  const monthsMap = {
    "30days": 3,
    "90days": 6,
    "180days": 12,
    "1year": 12,
    "2years": 24
  };
  const monthsBack = monthsMap[timeRange] || 6;
  const cacheKey = getForecastCacheKey(userId, clientId, timeRange);

  const result = await getCachedOrCompute(
    env.CACHE,
    cacheKey,
    async () => {
      const monthlyData = await getMonthlyData(env.DB, userId, clientId, monthsBack);
      const forecasts = generateAllForecasts(monthlyData, 3);
      const seasonality = detectSeasonality(monthlyData, "revenue");

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
    1800
  );

  return successResponse(result, result.fromCache);
}

async function handleInsights(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const cacheKey = getInsightsCacheKey(userId, clientId);

  const result = await getCachedOrCompute(
    env.CACHE,
    cacheKey,
    async () => {
      const monthlyData = await getMonthlyData(env.DB, userId, clientId, 6);
      const categoryBreakdown = await getCategoryBreakdown(env.DB, userId, clientId, 3);
      const forecasts = generateAllForecasts(monthlyData, 3);
      const anomalies = await detectAnomalies(env.DB, userId, clientId, categoryBreakdown);
      const insights = await generateInsights(env.AI, monthlyData, forecasts, categoryBreakdown);

      return {
        insights,
        anomalies,
        categoryBreakdown,
        generatedAt: new Date().toISOString()
      };
    },
    3600
  );

  return successResponse(result, result.fromCache);
}

async function handleDashboard(request, env, userId) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id");
  const cacheKey = getDashboardCacheKey(userId, clientId);

  const result = await getCachedOrCompute(
    env.CACHE,
    cacheKey,
    async () => {
      const [monthlyData, categoryBreakdown] = await Promise.all([
        getMonthlyData(env.DB, userId, clientId, 12),
        getCategoryBreakdown(env.DB, userId, clientId, 3)
      ]);

      const revenueForecast = generateForecast(monthlyData, 3, "revenue");

      const recentData = monthlyData.slice(-3);
      const currentMonth = recentData[recentData.length - 1];
      const previousMonth = recentData[recentData.length - 2];

      const kpis = {
        monthlyRevenue: currentMonth.revenue,
        monthlyExpenses: currentMonth.expenses,
        netProfit: currentMonth.profit,
        profitMargin:
          currentMonth.revenue > 0
            ? ((currentMonth.profit / currentMonth.revenue) * 100).toFixed(1)
            : 0,
        revenueChange:
          previousMonth.revenue > 0
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
    900
  );

  return successResponse(result, result.fromCache);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return handleOptions();
    }

    const payload = await authenticateRequest(request, env.JWT_SECRET);
    if (!payload) {
      return errorResponse("Authentication required", 401);
    }

    const userId = payload.userId;

    try {
      if (url.pathname === "/api/forecast" && request.method === "GET") {
        return await handleForecast(request, env, userId);
      }

      if (url.pathname === "/api/insights" && request.method === "GET") {
        return await handleInsights(request, env, userId);
      }

      if (url.pathname === "/api/dashboard" && request.method === "GET") {
        return await handleDashboard(request, env, userId);
      }

      return errorResponse("Not found", 404);
    } catch (error) {
      console.error("Worker error:", error);
      return errorResponse("Internal server error: " + error.message, 500);
    }
  }
};
