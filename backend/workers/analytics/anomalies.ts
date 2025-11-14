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

// ... (existing checkCategorySpikes and checkUnusualTransactions functions)

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

  const bindings = clientId ? [userId, clientId
