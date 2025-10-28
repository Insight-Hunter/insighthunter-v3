// workers/analytics/forecasting.test.js
// Example test structure (not executable in this environment)

import { generateForecast } from './forecasting.js';

const sampleData = [
  { month: '2024-01', revenue: 10000, expenses: 8000, profit: 2000 },
  { month: '2024-02', revenue: 11000, expenses: 8200, profit: 2800 },
  { month: '2024-03', revenue: 12000, expenses: 8500, profit: 3500 },
  { month: '2024-04', revenue: 13000, expenses: 8800, profit: 4200 }
];

const forecast = generateForecast(sampleData, 3, 'revenue');

console.assert(forecast.forecasts.length === 3, 'Should generate 3 forecasts');
console.assert(forecast.confidence > 0, 'Should have positive confidence');
console.assert(forecast.trend === 'increasing', 'Should detect increasing trend');
