// ============================================================================
// FORECASTING ALGORITHMS
// Statistical methods for predicting future values
// ============================================================================

function generateForecast(historicalData, periodsAhead = 3, metric = ‘revenue’) {
// Extract the values we want to forecast
const values = historicalData.map(d => d[metric]);

// Need at least 3 data points for meaningful forecast
if (values.length < 3) {
return {
forecasts: [],
confidence: 0,
method: ‘insufficient_data’
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
  const adjustedForecast = metric === 'revenue' && forecastValue < 0 ? 0 : forecastValue;
  
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
const variationCoefficient = avgValue !== 0 ? stdDev / Math.abs(avgValue) : 1;
const confidence = Math.max(0, Math.min(1, 1 - variationCoefficient));

return {
  forecasts,
  confidence: Math.round(confidence * 100) / 100,
  method: 'linear_regression',
  trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable'
};


} catch (error) {
console.error(‘Forecasting error:’, error);
return {
forecasts: [],
confidence: 0,
method: ‘error’
};
}
}

function getFuturePeriodLabel(lastMonth, periodsAhead) {
const date = new Date(lastMonth + ‘-01’);
date.setMonth(date.getMonth() + periodsAhead);
return date.toISOString().substring(0, 7);
}

function detectSeasonality(monthlyData, metric = ‘revenue’) {
// Simple seasonality detection: compare same months across years
const monthlyPatterns = {};

for (const data of monthlyData) {
const month = parseInt(data.month.split(’-’)[1]); // Extract month number
if (!monthlyPatterns[month]) {
monthlyPatterns[month] = [];
}
monthlyPatterns[month].push(data[metric]);
}

// Calculate average for each month
const monthlyAverages = {};
for (const [month, values] of Object.entries(monthlyPatterns)) {
monthlyAverages[month] = mean(values);
}

// Find the overall average
const overallAverage = mean(Object.values(monthlyAverages));

// Identify months that significantly deviate from average
const seasonalMonths = [];
for (const [month, avg] of Object.entries(monthlyAverages)) {
const deviation = ((avg - overallAverage) / overallAverage) * 100;
if (Math.abs(deviation) > 15) { // More than 15% deviation
seasonalMonths.push({
month: parseInt(month),
monthName: new Date(2024, parseInt(month) - 1, 1).toLocaleString(‘default’, { month: ‘long’ }),
deviation: Math.round(deviation),
pattern: deviation > 0 ? ‘high’ : ‘low’
});
}
}

return seasonalMonths.length > 0 ? seasonalMonths : null;
}


