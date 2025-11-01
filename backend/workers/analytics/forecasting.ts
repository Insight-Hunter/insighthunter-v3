// workers/analytics/forecasting.js
// Statistical forecasting algorithms for financial predictions

import { linearRegression, mean, standardDeviation } from "simple-statistics";

/**

- Generate forecast for a given metric using linear regression
- @param {Array} historicalData - Array of monthly data objects
- @param {number} periodsAhead - Number of periods to forecast
- @param {string} metric - The metric to forecast ("revenue", "expenses", "profit")
- @returns {Object} Forecast result with predictions and confidence
  */
  export function generateForecast(historicalData, periodsAhead = 3, metric = "revenue") {
  // Extract the values we want to forecast
  const values = historicalData.map(d => d[metric]);

// Need at least 3 data points for meaningful forecast
if (values.length < 3) {
return {
forecasts: [],
confidence: 0,
method: "insufficient_data",
message: "Not enough historical data for accurate forecasting"
};
}

// Create data points for linear regression
// X values are just the index (0, 1, 2, …)
// Y values are the actual metric values
const points = values.map((value, index) => [index, value]);

try {
// Calculate linear regression
const regression = linearRegression(points);
const slope = regression.m;
const intercept = regression.b;


// Generate forecasts for future periods
const forecasts = [];
const lastIndex = values.length - 1;

for (let i = 1; i <= periodsAhead; i++) {
  const futureIndex = lastIndex + i;
  const forecastValue = slope * futureIndex + intercept;
  
  // Don't allow negative forecasts for revenue
  const adjustedForecast = metric === 'revenue' && forecastValue < 0 
    ? 0 
    : forecastValue;
  
  forecasts.push({
    period: i,
    value: Math.round(adjustedForecast * 100) / 100,
    periodLabel: getFuturePeriodLabel(historicalData[lastIndex].month, i)
  });
}

// Calculate confidence based on how consistent the trend is
const residuals = values.map((value, index) => {
  const predicted = slope * index + intercept;
  return value - predicted;
});

const stdDev = standardDeviation(residuals);
const avgValue = mean(values);

// Confidence score: lower variance relative to mean = higher confidence
// This is the coefficient of variation approach
const variationCoefficient = avgValue !== 0 ? stdDev / Math.abs(avgValue) : 1;
const confidence = Math.max(0, Math.min(1, 1 - variationCoefficient));

// Determine trend direction
let trend;
if (Math.abs(slope) < avgValue * 0.01) {
  trend = 'stable';
} else if (slope > 0) {
  trend = 'increasing';
} else {
  trend = 'decreasing';
}

return {
  forecasts,
  confidence: Math.round(confidence * 100) / 100,
  method: 'linear_regression',
  trend,
  slope: Math.round(slope * 100) / 100
};

} catch (error) {
console.error("Forecasting error:", error);
return {
forecasts: [],
confidence: 0,
method: "error",
message: error.message
};
}
}

/**

- Calculate future period label by adding months to a date
- @param {string} lastMonth - The last month in YYYY-MM format
- @param {number} periodsAhead - Number of months ahead
- @returns {string} Future month in YYYY-MM format
  */
  function getFuturePeriodLabel(lastMonth, periodsAhead) {
  const date = new Date(lastMonth + "-01");
  date.setMonth(date.getMonth() + periodsAhead);
  return date.toISOString().substring(0, 7);
  }

/**

- Generate forecasts for all key metrics at once
- @param {Array} monthlyData - Historical monthly data
- @param {number} periodsAhead - Number of periods to forecast
- @returns {Object} Forecasts for revenue, expenses, and profit
  */
  export function generateAllForecasts(monthlyData, periodsAhead = 3) {
  return {
  revenue: generateForecast(monthlyData, periodsAhead, "revenue"),
  expenses: generateForecast(monthlyData, periodsAhead, "expenses"),
  profit: generateForecast(monthlyData, periodsAhead, "profit")
  };
  }
