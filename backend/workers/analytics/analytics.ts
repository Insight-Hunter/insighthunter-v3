import { Anomaly, AnomalySeverity, AnomalyType } from '../shared/types/analytics';

/**
 * Detect financial anomalies in spending patterns
 * @param {D1Database} db - The D1 database binding
 * @param {number} userId - The user ID
 * @param {number|null} clientId - Optional client ID
 * @param {Array} categoryBreakdown - Current category breakdown
 * @returns {Promise<Array>} Array of anomaly objects
 */
export async function detectAnomalies(
  db: any,
  userId: number,
  clientId: number | null,
  categoryBreakdown: any[]
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Check for categories with unusually high spending this month
  await checkCategorySpikes(db, userId, clientId, categoryBreakdown, anomalies);

  // Check for unusual individual transactions
  await checkUnusualTransactions(db, userId, clientId, anomalies);

  // Check for repeated transactions
  await checkRepeatedTransactions(db, userId, clientId, anomalies);

  // Check for income drops
  await checkIncomeDrops(db, userId, clientId, anomalies);

  // Check for unusual spending patterns
  await checkUnusualSpendingPatterns(db, userId, clientId, anomalies);

  // Sort by severity (high first)
  anomalies.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return anomalies;
}

/**
 * Check for category spending spikes
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Client ID
 * @param {Array} categoryBreakdown - Category breakdown
 * @param {Array} anomalies - Array to push anomalies to
 */
async function checkCategorySpikes(
  db: any,
  userId: number,
  clientId: number | null,
  categoryBreakdown: any[],
  anomalies: Anomaly[]
) {
  for (const category of categoryBreakdown.slice(0, 5)) {
    const historicalQuery = `
      SELECT AVG(monthly_total) as avg_spending FROM (
        SELECT strftime('%Y-%m', date) as month, SUM(ABS(amount)) as monthly_total
        FROM transactions
        WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
        AND category = ?
        AND date >= date('now', '-6 months')
        AND date < date('now', '-1 month')
        GROUP BY strftime('%Y-%m', date)
      )
    `;

    const bindings = clientId ? [userId, clientId, category.category] : [userId, category.category];
    const result = await db.prepare(historicalQuery).bind(...bindings).first();
    const avgSpending = result?.avg_spending || 0;

    const currentQuery = `
      SELECT SUM(ABS(amount)) as current_spending
      FROM transactions
      WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
      AND category = ?
      AND strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
    `;

    const currentBindings = clientId ? [userId, clientId, category.category] : [userId, category.category];
    const currentResult = await db.prepare(currentQuery).bind(...currentBindings).first();
    const currentSpending = currentResult?.current_spending || 0;

    if (currentSpending > avgSpending * 2) {
      anomalies.push({
        type: AnomalyType.SPENDING_SPIKE,
        severity: AnomalySeverity.HIGH,
        reason: `Spending spike in ${category.category}`,
        amount: currentSpending,
        expectedRange: { min: 0, max: avgSpending },
      });
    }
  }
}

/**
 * Check for unusual individual transactions
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Client ID
 * @param {Array} anomalies - Array to push anomalies to
 */
async function checkUnusualTransactions(
  db: any,
  userId: number,
  clientId: number | null,
  anomalies: Anomaly[]
) {
  const query = `
    SELECT amount, date, description
    FROM transactions
    WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
    AND amount > (SELECT AVG(amount) + 3 * STDDEV(amount) FROM transactions WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''})
  `;

  const bindings = clientId ? [userId, clientId, userId, clientId] : [userId, userId];
  const results = await db.prepare(query).bind(...bindings).all();

  for (const row of results.results) {
    anomalies.push({
      type: AnomalyType.EXPENSE_OUTLIER,
      severity: AnomalySeverity.HIGH,
      transaction: row,
      reason: 'Unusually high transaction amount',
      amount: row.amount,
      date: row.date,
    });
  }
}

/**
 * Check for repeated transactions
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Client ID
 * @param {Array} anomalies - Array to push anomalies to
 */
async function checkRepeatedTransactions(
  db: any,
  userId: number,
  clientId: number | null,
  anomalies: Anomaly[]
) {
  const query = `
    SELECT amount, description, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
    GROUP BY amount, description
    HAVING count > 1
  `;

  const bindings = clientId ? [userId, clientId] : [userId];
  const results = await db.prepare(query).bind(...bindings).all();

  for (const row of results.results) {
    anomalies.push({
      type: AnomalyType.REPEATED_TRANSACTION,
      severity: AnomalySeverity.MEDIUM,
      reason: `Repeated transaction: ${row.description} (count: ${row.count})`,
      amount: row.amount,
    });
  }
}

/**
 * Check for income drops
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Client ID
 * @param {Array} anomalies - Array to push anomalies to
 */
async function checkIncomeDrops(
  db: any,
  userId: number,
  clientId: number | null,
  anomalies: Anomaly[]
) {
  const query = `
    SELECT strftime('%Y-%m', date) as month, SUM(amount) as monthly_income
    FROM transactions
    WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
    AND amount > 0
    GROUP BY strftime('%Y-%m', date)
    ORDER BY month DESC
    LIMIT 2
  `;

  const bindings = clientId ? [userId, clientId] : [userId];
  const results = await db.prepare(query).bind(...bindings).all();

  if (results.results.length === 2) {
    const [current, previous] = results.results;
    if (current.monthly_income < previous.monthly_income * 0.5) {
      anomalies.push({
        type: AnomalyType.INCOME_DROP,
        severity: AnomalySeverity.HIGH,
        reason: `Income dropped by more than 50% from ${previous.month} to ${current.month}`,
        amount: current.monthly_income,
        expectedRange: { min: 0, max: previous.monthly_income },
      });
    }
  }
}

/**
 * Check for unusual spending patterns
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Client ID
 * @param {Array} anomalies - Array to push anomalies to
 */
async function checkUnusualSpendingPatterns(
  db: any,
  userId: number,
  clientId: number | null,
  anomalies: Anomaly[]
) {
  const query = `
    SELECT category, strftime('%H', date) as hour, COUNT(*) as count
    FROM transactions
    WHERE user_id = ? ${clientId ? 'AND client_id = ?' : ''}
    AND amount < 0
    GROUP BY category, hour
    ORDER BY count DESC
    LIMIT 10
  `;

  const bindings = clientId ? [userId, clientId] : [userId];
  const results = await db.prepare(query).bind(...bindings).all();

  for (const row of results.results) {
    if (row.count > 5 && (row.hour < '06' || row.hour > '22')) {
      anomalies.push({
        type: AnomalyType.UNUSUAL_PATTERN,
        severity: AnomalySeverity.MEDIUM,
        reason: `Unusual spending pattern: ${row.category} at ${row.hour}:00`,
        amount: row.count,
      });
    }
  }
}
