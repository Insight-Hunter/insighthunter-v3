// workers/management/users.js
// User profile and settings management

/**

- Get user profile information
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @returns {Promise<Object|null>} User profile or null if not found
  */
  export async function getUserProfile(db, userId) {
  const user = await db.prepare(`SELECT  id, email, name, plan_type, plan_started_at, plan_expires_at, created_at FROM users WHERE id = ?  `).bind(userId).first();

if (!user) {
return null;
}

// Get usage statistics
const stats = await getUserStats(db, userId);

return {
…user,
stats
};
}

/**

- Get user usage statistics
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @returns {Promise<Object>} Usage statistics
  */
  export async function getUserStats(db, userId) {
  // Get current month start
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

// Count clients
const clientsResult = await db.prepare(
‘SELECT COUNT(*) as count FROM clients WHERE user_id = ? AND status = ?’
).bind(userId, ‘active’).first();

// Count transactions this month
const transactionsResult = await db.prepare(
‘SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND uploaded_at >= ?’
).bind(userId, monthStart.toISOString()).first();

// Count CSV uploads this month
const uploadsResult = await db.prepare(
‘SELECT COUNT(*) as count FROM csv_uploads WHERE user_id = ? AND uploaded_at >= ?’
).bind(userId, monthStart.toISOString()).first();

// Get total transaction count
const totalTransactionsResult = await db.prepare(
‘SELECT COUNT(*) as count FROM transactions WHERE user_id = ?’
).bind(userId).first();

return {
activeClients: clientsResult.count,
transactionsThisMonth: transactionsResult.count,
csvUploadsThisMonth: uploadsResult.count,
totalTransactions: totalTransactionsResult.count
};
}

/**

- Update user profile
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {Object} updates - Fields to update
- @returns {Promise<Object>} Updated user profile
  */
  export async function updateUserProfile(db, userId, updates) {
  const allowedFields = [‘name’, ‘email’];
  const updateFields = [];
  const values = [];

for (const field of allowedFields) {
if (updates[field] !== undefined) {
updateFields.push(`${field} = ?`);
values.push(updates[field]);
}
}

if (updateFields.length === 0) {
throw new Error(‘No valid fields to update’);
}

// Add updated_at
updateFields.push(‘updated_at = ?’);
values.push(new Date().toISOString());

// Add userId for WHERE clause
values.push(userId);

// If email is being changed, verify it’s not already in use
if (updates.email) {
const existing = await db.prepare(
‘SELECT id FROM users WHERE email = ? AND id != ?’
).bind(updates.email, userId).first();

```
if (existing) {
  throw new Error('Email already in use');
}
```

}

await db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`).bind(…values).run();

return await getUserProfile(db, userId);
}

/**

- Update user plan (for subscription changes)
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {string} newPlanType - New plan type
- @param {string|null} expiresAt - Plan expiration date (null for lifetime)
- @returns {Promise<Object>} Updated user profile
  */
  export async function updateUserPlan(db, userId, newPlanType, expiresAt = null) {
  const validPlans = [‘free’, ‘professional’, ‘enterprise’];

if (!validPlans.includes(newPlanType)) {
throw new Error(`Invalid plan type. Must be one of: ${validPlans.join(', ')}`);
}

const now = new Date().toISOString();

await db.prepare(`UPDATE users SET  plan_type = ?, plan_started_at = ?, plan_expires_at = ?, updated_at = ? WHERE id = ?`).bind(newPlanType, now, expiresAt, now, userId).run();

return await getUserProfile(db, userId);
}

/**

- Get user’s activity history
- @param {D1Database} db - Database binding
- @param {number} userId - User ID
- @param {number} limit - Number of activities to return
- @returns {Promise<Array>} Array of activity objects
  */
  export async function getUserActivity(db, userId, limit = 20) {
  // Get recent CSV uploads
  const uploads = await db.prepare(`SELECT  'csv_upload' as activity_type, filename as description, uploaded_at as timestamp, row_count as metadata FROM csv_uploads WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT ?  `).bind(userId, limit).all();

// Get recent client creations (if enterprise user)
const clients = await db.prepare(`SELECT  'client_created' as activity_type, company_name as description, created_at as timestamp, NULL as metadata FROM clients WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).bind(userId, limit).all();

// Combine and sort by timestamp
const activities = […uploads.results, …clients.results]
.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
.slice(0, limit);

return activities;
}
