// workers/analytics/seasonality.js
// Detect seasonal patterns in financial data

import { mean } from ‘simple-statistics’;

/**

- Detect seasonal patterns in monthly data
- @param {Array} monthlyData - Array of monthly data objects
- @param {string} metric - The metric to analyze for seasonality
- @returns {Array|null} Array of seasonal patterns or null if none detected
  */
  export function detectSeasonality(monthlyData, metric = ‘revenue’) {
  // Need at least 12 months of data to detect seasonality
  if (monthlyData.length < 12) {
  return null;
  }

// Group data by month number (1-12) across all years
const monthlyPatterns = {};

for (const data of monthlyData) {
const month = parseInt(data.month.split(’-’)[1]); // Extract month number
if (!monthlyPatterns[month]) {
monthlyPatterns[month] = [];
}
monthlyPatterns[month].push(data[metric]);
}

// Calculate average for each month across all years
const monthlyAverages = {};
for (const [month, values] of Object.entries(monthlyPatterns)) {
// Only consider months that appear at least twice for reliability
if (values.length >= 2) {
monthlyAverages[month] = mean(values);
}
}

// Find the overall average across all months
const overallAverage = mean(Object.values(monthlyAverages));

if (overallAverage === 0) {
return null; // Can’t calculate meaningful seasonality with zero average
}

// Identify months that significantly deviate from average
const seasonalMonths = [];
const SIGNIFICANCE_THRESHOLD = 15; // 15% deviation threshold

for (const [month, avg] of Object.entries(monthlyAverages)) {
const deviation = ((avg - overallAverage) / overallAverage) * 100;

```
if (Math.abs(deviation) > SIGNIFICANCE_THRESHOLD) {
  seasonalMonths.push({
    month: parseInt(month),
    monthName: getMonthName(parseInt(month)),
    deviation: Math.round(deviation),
    pattern: deviation > 0 ? 'high' : 'low',
    averageValue: Math.round(avg * 100) / 100,
    occurrences: monthlyPatterns[month].length
  });
}
```

}

// Sort by absolute deviation (most significant first)
seasonalMonths.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));

return seasonalMonths.length > 0 ? seasonalMonths : null;
}

/**

- Get month name from month number
- @param {number} monthNumber - Month number (1-12)
- @returns {string} Full month name
  */
  function getMonthName(monthNumber) {
  const date = new Date(2024, monthNumber - 1, 1);
  return date.toLocaleString(‘default’, { month: ‘long’ });
  }

/**

- Apply seasonal adjustment to forecasts
- @param {Array} forecasts - Array of forecast objects
- @param {Array} seasonalPatterns - Detected seasonal patterns
- @param {number} overallAverage - Overall average value
- @returns {Array} Adjusted forecasts
  */
  export function applySeasonalAdjustment(forecasts, seasonalPatterns, overallAverage) {
  if (!seasonalPatterns || seasonalPatterns.length === 0) {
  return forecasts;
  }

return forecasts.map(forecast => {
// Extract month from period label
const forecastMonth = parseInt(forecast.periodLabel.split(’-’)[1]);

```
// Find if this month has a seasonal pattern
const seasonalPattern = seasonalPatterns.find(p => p.month === forecastMonth);

if (seasonalPattern) {
  // Apply the seasonal adjustment
  const adjustmentFactor = 1 + (seasonalPattern.deviation / 100);
  const adjustedValue = forecast.value * adjustmentFactor;
  
  return {
    ...forecast,
    value: Math.round(adjustedValue * 100) / 100,
    seasonalAdjustment: seasonalPattern.deviation,
    unadjustedValue: forecast.value
  };
}

return forecast;
```

});
}
