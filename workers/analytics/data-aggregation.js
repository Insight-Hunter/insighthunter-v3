// workers/analytics/data-aggregation.js
// Database queries and data aggregation functions

/**

- Get monthly aggregated transaction data
- @param {D1Database} db - The D1 database binding
- @param {number} userId - The user ID to query for
- @param {number|null} clientId - Optional client ID to filter by
- @param {number} monthsBack - How many months of history to retrieve
- @returns {Promise<Array>} Array of monthly data objects
  */
  export async function getMonthlyData(db, userId, clientId, monthsBack = 12) {
  // Calculate the date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

// Query transactions grouped by month
const query = `SELECT  strftime('%Y-%m', date) as month, SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as revenue, SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as expenses, COUNT(*) as transaction_count FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= ? AND date <= ? GROUP BY strftime('%Y-%m', date) ORDER BY month ASC`;

const bindings = clientId
? [userId, clientId, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
: [userId, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]];

const result = await db.prepare(query).bind(...bindings).all();

// Fill in missing months with zero values to ensure continuous time series
const monthlyData = [];
const current = new Date(startDate);

while (current <= endDate) {
const monthKey = current.toISOString().substring(0, 7);
const existingData = result.results.find(r => r.month === monthKey);


monthlyData.push({
  month: monthKey,
  revenue: existingData ? existingData.revenue : 0,
  expenses: existingData ? existingData.expenses : 0,
  profit: existingData ? (existingData.revenue - existingData.expenses) : 0,
  transactionCount: existingData ? existingData.transaction_count : 0
});

current.setMonth(current.getMonth() + 1);


}

return monthlyData;
}

/**

- Get expense breakdown by category
- @param {D1Database} db - The D1 database binding
- @param {number} userId - The user ID to query for
- @param {number|null} clientId - Optional client ID to filter by
- @param {number} months - Number of recent months to include
- @returns {Promise<Array>} Array of category breakdown objects
  */
  export async function getCategoryBreakdown(db, userId, clientId, months = 3) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

const query = `SELECT  category, SUM(ABS(amount)) as total, COUNT(*) as count, AVG(ABS(amount)) as average FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= ? AND amount < 0 AND category IS NOT NULL AND category != 'Uncategorized' GROUP BY category ORDER BY total DESC LIMIT 15`;

const bindings = clientId
? [userId, clientId, startDate.toISOString().split("T")[0]]
: [userId, startDate.toISOString().split("T")[0]];

const result = await db.prepare(query).bind(...bindings).all();
return result.results;
}

/**

- Get recent transactions for detailed analysis
- @param {D1Database} db - The D1 database binding
- @param {number} userId - The user ID
- @param {number|null} clientId - Optional client ID
- @param {number} days - Number of days back to query
- @param {number} limit - Maximum number of transactions to return
- @returns {Promise<Array>} Array of transaction objects
  */
  export async function getRecentTransactions(db, userId, clientId, days = 30, limit = 100) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

const query = `SELECT * FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND date >= ? ORDER BY date DESC LIMIT ?`;

const bindings = clientId
? [userId, clientId, startDate.toISOString().split("T")[0], limit]
: [userId, startDate.toISOString().split("T")[0], limit];

const result = await db.prepare(query).bind(...bindings).all();
return result.results;
}
