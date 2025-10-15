// workers/analytics/index-ai.js
// Analytics Worker with Workers AI (Llama 3.1) and Vectorize

export default {
async fetch(request, env, ctx) {
const corsHeaders = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Methods’: ‘GET, POST, OPTIONS’,
‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’,
};

```
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

const url = new URL(request.url);
const path = url.pathname;

try {
  // Authenticate
  const user = await authenticateRequest(request, env);

  if (path === '/insights' && request.method === 'POST') {
    return await handleGenerateInsights(request, env, user, corsHeaders);
  }

  if (path === '/forecast' && request.method === 'POST') {
    return await handleGenerateForecast(request, env, user, corsHeaders);
  }

  if (path === '/search' && request.method === 'POST') {
    return await handleSemanticSearch(request, env, user, corsHeaders);
  }

  if (path === '/categorize' && request.method === 'POST') {
    return await handleAICategorize(request, env, user, corsHeaders);
  }

  if (path === '/dashboard' && request.method === 'GET') {
    return await handleDashboardData(request, env, user, corsHeaders);
  }

  return jsonResponse({ error: 'Route not found' }, 404, corsHeaders);

} catch (error) {
  console.error('Analytics Error:', error);
  return jsonResponse({ error: error.message }, 500, corsHeaders);
}
```

}
};

/**

- Generate AI insights using Llama 3.1
  */
  async function handleGenerateInsights(request, env, user, corsHeaders) {
  const { clientId, dateRange } = await request.json();

if (!clientId) {
return jsonResponse({ error: ‘Client ID required’ }, 400, corsHeaders);
}

// Check cache first
const cacheKey = `insights:${clientId}:${dateRange?.start || 'all'}:${dateRange?.end || 'all'}`;
const cached = await env.KV.get(cacheKey, ‘json’);

if (cached && cached.expiresAt > Date.now()) {
return jsonResponse({ …cached, fromCache: true }, 200, corsHeaders);
}

// Get transactions
let query = env.DB.prepare(
‘SELECT * FROM transactions WHERE client_id = ? ORDER BY date DESC’
).bind(clientId);

const { results: transactions } = await query.all();

if (transactions.length === 0) {
return jsonResponse({ error: ‘No transactions found’ }, 404, corsHeaders);
}

// Calculate basic metrics
const metrics = calculateMetrics(transactions);

// Generate AI insights using Llama 3.1
const aiInsights = await generateAIInsights(env, transactions, metrics);

const response = {
clientId,
metrics,
insights: aiInsights,
transactionCount: transactions.length,
generatedAt: Date.now()
};

// Cache for 1 hour
await env.KV.put(cacheKey, JSON.stringify({
…response,
expiresAt: Date.now() + 3600000
}), { expirationTtl: 3600 });

return jsonResponse(response, 200, corsHeaders);
}

/**

- Generate financial forecast using Workers AI
  */
  async function handleGenerateForecast(request, env, user, corsHeaders) {
  const { clientId, forecastType, months = 6 } = await request.json();

if (!clientId || !forecastType) {
return jsonResponse({ error: ‘Client ID and forecast type required’ }, 400, corsHeaders);
}

// Get historical data (last 12 months)
const twelveMonthsAgo = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);

const { results: transactions } = await env.DB.prepare(
‘SELECT * FROM transactions WHERE client_id = ? AND date >= ? ORDER BY date ASC’
).bind(clientId, twelveMonthsAgo).all();

if (transactions.length < 10) {
return jsonResponse({
error: ‘Insufficient data for forecasting (minimum 10 transactions required)’
}, 400, corsHeaders);
}

// Prepare time series data
const timeSeriesData = prepareTimeSeriesData(transactions, forecastType);

// Generate forecast using Llama 3.1
const forecast = await generateAIForecast(env, timeSeriesData, forecastType, months);

// Save forecast to D1
const forecastId = crypto.randomUUID();
await env.DB.prepare(
`INSERT INTO forecasts (id, client_id, type, predictions, confidence, period_months, model_used, created_at) VALUES (?, ?, ?, ?, ?, ?, 'llama-3.1-8b', unixepoch())`
).bind(
forecastId,
clientId,
forecastType,
JSON.stringify(forecast.predictions),
JSON.stringify(forecast.confidence),
months
).run();

return jsonResponse({
forecastId,
type: forecastType,
predictions: forecast.predictions,
confidence: forecast.confidence,
metadata: forecast.metadata
}, 200, corsHeaders);
}

/**

- Semantic search using Vectorize
  */
  async function handleSemanticSearch(request, env, user, corsHeaders) {
  const { clientId, query, limit = 10 } = await request.json();

if (!clientId || !query) {
return jsonResponse({ error: ‘Client ID and query required’ }, 400, corsHeaders);
}

// Generate embedding for query
const embedding = await env.AI.run(’@cf/baai/bge-base-en-v1.5’, {
text: [query]
});

// Search in Vectorize
const results = await env.VECTORIZE.query(embedding.data[0], {
topK: limit,
filter: { clientId }
});

// Get full transaction details from D1
const transactionIds = results.matches.map(m => m.id);
const placeholders = transactionIds.map(() => ‘?’).join(’,’);

const { results: transactions } = await env.DB.prepare(
`SELECT * FROM transactions WHERE id IN (${placeholders})`
).bind(…transactionIds).all();

return jsonResponse({
query,
results: transactions.map((t, i) => ({
…t,
score: results.matches[i].score
}))
}, 200, corsHeaders);
}

/**

- AI-powered transaction categorization
  */
  async function handleAICategorize(request, env, user, corsHeaders) {
  const { description, amount } = await request.json();

if (!description || !amount) {
return jsonResponse({ error: ‘Description and amount required’ }, 400, corsHeaders);
}

// Use Llama 3.1 to categorize
const response = await env.AI.run(’@cf/meta/llama-3.1-8b-instruct’, {
messages: [
{
role: ‘system’,
content: ‘You are a financial categorization expert. Categorize transactions into one of these categories: Payroll, Rent, Utilities, Marketing, Supplies, Insurance, Travel, Meals, Software, Professional Services, Sales, Services, Interest, Other Income, Other Expenses. Respond with ONLY the category name, nothing else.’
},
{
role: ‘user’,
content: `Categorize this transaction: "${description}" Amount: $${amount}`
}
]
});

const category = response.response.trim();
const confidence = response.confidence || 0.8;

return jsonResponse({
category,
confidence,
description,
amount
}, 200, corsHeaders);
}

/**

- Get dashboard data with cached KPIs
  */
  async function handleDashboardData(request, env, user, corsHeaders) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get(‘clientId’);

if (!clientId) {
return jsonResponse({ error: ‘Client ID required’ }, 400, corsHeaders);
}

// Check cache
const cacheKey = `dashboard:${clientId}`;
const cached = await env.KV.get(cacheKey, ‘json’);

if (cached && cached.expiresAt > Date.now()) {
return jsonResponse({ …cached, fromCache: true }, 200, corsHeaders);
}

// Get last 30 days
const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

const { results: transactions } = await env.DB.prepare(
‘SELECT * FROM transactions WHERE client_id = ? AND date >= ? ORDER BY date DESC’
).bind(clientId, thirtyDaysAgo).all();

const kpis = calculateKPIs(transactions);

const response = {
clientId,
kpis,
recentTransactions: transactions.slice(0, 10),
transactionCount: transactions.length,
expiresAt: Date.now() + 300000 // 5 minutes
};

// Cache for 5 minutes
await env.KV.put(cacheKey, JSON.stringify(response), { expirationTtl: 300 });

return jsonResponse(response, 200, corsHeaders);
}

/**

- Generate AI insights using Llama 3.1
  */
  async function generateAIInsights(env, transactions, metrics) {
  const prompt = `Analyze this financial data and provide 3-5 actionable insights:

Metrics:

- Total Income: $${metrics.totalIncome}
- Total Expenses: $${metrics.totalExpenses}
- Net Income: $${metrics.netIncome}
- Profit Margin: ${metrics.profitMargin}%
- Transaction Count: ${transactions.length}

Top Expense Categories:
${Object.entries(metrics.expensesByCategory)
.sort((a, b) => b[1] - a[1])
.slice(0, 5)
.map(([cat, amt]) => `- ${cat}: $${amt}`)
.join(’\n’)}

Provide insights in JSON format:
{
“insights”: [
{“type”: “string”, “title”: “string”, “message”: “string”, “severity”: “info|warning|critical”}
]
}`;

const response = await env.AI.run(’@cf/meta/llama-3.1-8b-instruct’, {
messages: [
{
role: ‘system’,
content: ‘You are a CFO providing financial insights. Respond ONLY with valid JSON, no additional text.’
},
{
role: ‘user’,
content: prompt
}
]
});

try {
const parsed = JSON.parse(response.response);
return parsed.insights || [];
} catch (e) {
// Fallback to basic insights
return generateBasicInsights(metrics);
}
}

/**

- Generate forecast using Llama 3.1
  */
  async function generateAIForecast(env, timeSeriesData, forecastType, months) {
  const prompt = `Based on this historical financial data, forecast the next ${months} months:

Historical Data (monthly):
${JSON.stringify(timeSeriesData, null, 2)}

Forecast Type: ${forecastType}

Provide forecast in JSON format:
{
“predictions”: [
{“month”: “YYYY-MM”, “value”: number, “confidence”: “high|medium|low”}
],
“confidence”: {“score”: number, “level”: “string”},
“metadata”: {“trend”: “string”, “notes”: “string”}
}`;

const response = await env.AI.run(’@cf/meta/llama-3.1-8b-instruct’, {
messages: [
{
role: ‘system’,
content: ‘You are a financial forecasting expert. Respond ONLY with valid JSON.’
},
{
role: ‘user’,
content: prompt
}
],
max_tokens: 1024
});

try {
return JSON.parse(response.response);
} catch (e) {
// Fallback to statistical forecast
return generateStatisticalForecast(timeSeriesData, months);
}
}

/**

- Helper functions
  */

function calculateMetrics(transactions) {
const income = transactions.filter(t => t.type === ‘income’);
const expenses = transactions.filter(t => t.type === ‘expense’);

const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
const netIncome = totalIncome - totalExpenses;
const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

const expensesByCategory = {};
expenses.forEach(t => {
expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
});

return {
totalIncome,
totalExpenses,
netIncome,
profitMargin,
expensesByCategory
};
}

function calculateKPIs(transactions) {
const metrics = calculateMetrics(transactions);
const burnRate = metrics.totalExpenses / 30;

return {
totalIncome: metrics.totalIncome,
totalExpenses: metrics.totalExpenses,
netIncome: metrics.netIncome,
profitMargin: metrics.profitMargin,
dailyBurnRate: burnRate,
runway: burnRate > 0 ? metrics.netIncome / burnRate : Infinity
};
}

function prepareTimeSeriesData(transactions, forecastType) {
const monthlyData = {};

transactions.forEach(t => {
const date = new Date(t.date * 1000);
const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

```
if (!monthlyData[monthKey]) {
  monthlyData[monthKey] = { income: 0, expenses: 0 };
}

if (t.type === 'income') {
  monthlyData[monthKey].income += t.amount;
} else if (t.type === 'expense') {
  monthlyData[monthKey].expenses += t.amount;
}
```

});

return Object.entries(monthlyData)
.sort((a, b) => a[0].localeCompare(b[0]))
.map(([month, data]) => ({
month,
value: forecastType === ‘revenue’ ? data.income :
forecastType === ‘expenses’ ? data.expenses :
data.income - data.expenses
}));
}

function generateBasicInsights(metrics) {
const insights = [];

if (metrics.netIncome < 0) {
insights.push({
type: ‘cash_flow’,
title: ‘Negative Cash Flow’,
message: ‘Expenses exceed income. Review spending and increase revenue.’,
severity: ‘critical’
});
}

if (metrics.profitMargin < 20) {
insights.push({
type: ‘margin’,
title: ‘Low Profit Margin’,
message: `Profit margin is ${metrics.profitMargin.toFixed(1)}%. Consider cost optimization.`,
severity: ‘warning’
});
}

return insights;
}

function generateStatisticalForecast(timeSeriesData, months) {
// Simple linear regression fallback
const values = timeSeriesData.map(d => d.value);
const avg = values.reduce((a, b) => a + b, 0) / values.length;

const predictions = [];
for (let i = 0; i < months; i++) {
predictions.push({
month: `future-${i + 1}`,
value: avg,
confidence: ‘medium’
});
}

return {
predictions,
confidence: { score: 0.6, level: ‘medium’ },
metadata: { trend: ‘stable’, notes: ‘Statistical average’ }
};
}

async function authenticateRequest(request, env) {
const sessionId = request.headers.get(‘Authorization’)?.replace(’Bearer ’, ‘’);
if (!sessionId) throw new Error(‘Unauthorized’);

const session = await env.KV.get(`session:${sessionId}`, ‘json’);
if (!session) throw new Error(‘Invalid session’);

return session.user;
}

function jsonResponse(data, status = 200, headers = {}) {
return new Response(JSON.stringify(data), {
status,
headers: { ‘Content-Type’: ‘application/json’, …headers }
});
}
