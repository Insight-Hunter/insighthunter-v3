// workers/analytics/anomalies.js
// Detect unusual transactions and spending patterns

/**

- Detect financial anomalies in spending patterns
- @param {D1Database} db - The D1 database binding
- @param {number} userId - The user ID
- @param {number|null} clientId - Optional client ID
- @param {Array} categoryBreakdown - Current category breakdown
- @returns {Promise<Array>} Array of anomaly objects
  */
  export async function detectAnomalies(db, userId, clientId, categoryBreakdown) {
  const anomalies = [];

// Check for categories with unusually high spending this month
await checkCategorySpikes(db, userId, clientId, categoryBreakdown, anomalies);

// Check for unusual individual transactions
await checkUnusualTransactions(db, userId, clientId, anomalies);

// Sort by severity (high first)
anomalies.sort((a, b) => {
const severityOrder = { high: 0, medium: 1, low: 2 };
return severityOrder[a.severity] - severityOrder[b.severity];
});

return anomalies;
}

/**

- Check for category spending spikes
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {number|null} clientId - Client ID
- @param {Array} categoryBreakdown - Category breakdown
- @param {Array} anomalies - Array to push anomalies to
  */
  async function checkCategorySpikes(db, userId, clientId, categoryBreakdown, anomalies) {
  // Check top 5 categories for unusual increases
  for (const category of categoryBreakdown.slice(0, 5)) {
  // Get historical average for this category (last 6 months, excluding current)
  const historicalQuery = `SELECT AVG(monthly_total) as avg_spending FROM ( SELECT  strftime('%Y-%m', date) as month, SUM(ABS(amount)) as monthly_total FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''} AND category = ? AND date >= date('now', '-6 months') AND date < date('now', '-1 month') GROUP BY strftime('%Y-%m', date) )`;
  
  const bindings = clientId
  ? [userI
