// workers/management/alerts.js
// Alert and notification management

/**
 * Get alerts for a user or client
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Optional client ID to filter by
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of alert objects
 */
export async function getAlerts(db, userId, clientId = null, options = {}) {
  const {
    includeRead = false,
    includeDismissed = false,
    severity = null,
    limit = 50
  } = options;

  let query = `SELECT id, client_id, alert_type, severity, title, message, created_at, read_at, dismissed_at FROM alerts WHERE user_id = ?`;
  const bindings = [userId];

  // Filter by client if specified
  if (clientId !== null) {
    query += ' AND client_id = ?';
    bindings.push(clientId);
  }

  // Filter out read alerts unless requested
  if (!includeRead) {
    query += ' AND read_at IS NULL';
  }

  // Filter out dismissed alerts unless requested
  if (!includeDismissed) {
    query += ' AND dismissed_at IS NULL';
  }

  // Filter by severity if specified
  if (severity) {
    query += ' AND severity = ?';
    bindings.push(severity);
  }

  query += ' ORDER BY created_at DESC LIMIT ?';
  bindings.push(limit);

  const result = await db.prepare(query).bind(...bindings).all();
  return result.results;
}

/**
 * Create a new alert
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {Object} alertData - Alert information
 * @returns {Promise<Object>} Created alert object
 */
export async function createAlert(db, userId, alertData) {
  const {
    client_id = null,
    alert_type,
    severity,
    title,
    message
  } = alertData;

  // Validate required fields
  if (!alert_type || !severity || !title || !message) {
    throw new Error('alert_type, severity, title, and message are required');
  }

  // Validate severity
  const validSeverities = ['info', 'warning', 'critical'];
  if (!validSeverities.includes(severity)) {
    throw new Error(`Severity must be one of: ${validSeverities.join(', ')}`);
  }

  const now = new Date().toISOString();

  const result = await db.prepare(`INSERT INTO alerts (user_id, client_id, alert_type, severity, title, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(
    userId,
    client_id,
    alert_type,
    severity,
    title,
    message,
    now
  ).run();

  return {
    id: result.meta.last_row_id,
    user_id: userId,
    client_id,
    alert_type,
    severity,
    title,
    message,
    created_at: now,
    read_at: null,
    dismissed_at: null
  };
}

/**
 * Mark an alert as read
 * @param {D1Database} db - Database binding
 * @param {number} alertId - Alert ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export async function markAlertRead(db, alertId, userId) {
  // Verify alert belongs to user
  const alert = await db.prepare(
    'SELECT id FROM alerts WHERE id = ? AND user_id = ?'
  ).bind(alertId, userId).first();

  if (!alert) {
    throw new Error('Alert not found or access denied');
  }

  await db.prepare(`UPDATE alerts SET read_at = ? WHERE id = ? AND user_id = ?`).bind(new Date().toISOString(), alertId, userId).run();

  return true;
}

/**
 * Mark all alerts as read for a user
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Optional client ID to filter by
 * @returns {Promise<number>} Number of alerts marked as read
 */
export async function markAllAlertsRead(db, userId, clientId = null) {
  const query = clientId
    ? 'UPDATE alerts SET read_at = ? WHERE user_id = ? AND client_id = ? AND read_at IS NULL'
    : 'UPDATE alerts SET read_at = ? WHERE user_id = ? AND read_at IS NULL';

  const bindings = clientId
    ? [new Date().toISOString(), userId, clientId]
    : [new Date().toISOString(), userId];

  const result = await db.prepare(query).bind(...bindings).run();

  return result.meta.changes;
}

/**
 * Dismiss an alert
 * @param {D1Database} db - Database binding
 * @param {number} alertId - Alert ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<boolean>} Success status
 */
export async function dismissAlert(db, alertId, userId) {
  // Verify alert belongs to user
  const alert = await db.prepare(
    'SELECT id FROM alerts WHERE id = ? AND user_id = ?'
  ).bind(alertId, userId).first();

  if (!alert) {
    throw new Error('Alert not found or access denied');
  }

  await db.prepare(`UPDATE alerts SET dismissed_at = ?, read_at = COALESCE(read_at, ?) WHERE id = ? AND user_id = ?`).bind(
    new Date().toISOString(),
    new Date().toISOString(),
    alertId,
    userId
  ).run();

  return true;
}

/**
 * Get alert statistics for a user
 * @param {D1Database} db - Database binding
 * @param {number} userId - User ID
 * @param {number|null} clientId - Optional client ID
 * @returns {Promise<Object>} Alert statistics
 */
export async function getAlertStats(db, userId, clientId = null) {
  const query = clientId
    ? `SELECT COUNT(*) as total, 
               SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END) as unread, 
               SUM(CASE WHEN severity = 'critical' AND dismissed_at IS NULL THEN 1 ELSE 0 END) as critical, 
               SUM(CASE WHEN severity = 'warning' AND dismissed_at IS NULL THEN 1 ELSE 0 END) as warnings 
         FROM alerts WHERE user_id = ? AND client_id = ?`
    : `SELECT COUNT(*) as total, 
               SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END) as unread, 
               SUM(CASE WHEN severity = 'critical' AND dismissed_at IS NULL THEN 1 ELSE 0 END) as critical, 
               SUM(CASE WHEN severity = 'warning' AND dismissed_at IS NULL THEN 1 ELSE 0 END) as warnings 
         FROM alerts WHERE user_id = ?`;

  const bindings = clientId ? [userId, clientId] : [userId];
  const result = await db.prepare(query).bind(...bindings).first();

  return result || {
    total: 0,
    unread: 0,
    critical: 0,
    warnings: 0
  };
}
