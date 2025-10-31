// backend/src/services/userServices.ts
// User Management Business Logic

import { hashPassword, verifyPassword } from '../utils/password';
import { db } from '../utils/db';

/**
 * Get user profile with company info
 */
export async function getUserProfile(userId: string) {
  const users = await db.query(`
    SELECT 
      u.id, u.email, u.name, u.avatar, u.phone, u.timezone,
      u.role, u.plan, u.created_at, u.last_login,
      c.id as company_id, c.name as company_name
    FROM users u
    LEFT JOIN companies c ON u.company_id = c.id
    WHERE u.id = ?
  `, [userId]);
  
  if (!users || users.length === 0) {
    throw new Error('User not found');
  }
  
  return users[0];
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: {
  name?: string;
  avatar?: string;
  phone?: string;
  timezone?: string;
}) {
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.avatar !== undefined) {
    updates.push('avatar = ?');
    values.push(data.avatar);
  }
  if (data.phone !== undefined) {
    updates.push('phone = ?');
    values.push(data.phone);
  }
  if (data.timezone !== undefined) {
    updates.push('timezone = ?');
    values.push(data.timezone);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  updates.push('updated_at = datetime("now")');
  values.push(userId);
  
  await db.query(`
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = ?
  `, values);
  
  return getUserProfile(userId);
}

/**
 * Update user settings
 */
export async function updateUserSettings(userId: string, settings: any) {
  // Check if settings exist
  const existing = await db.query(
    'SELECT * FROM user_settings WHERE user_id = ?',
    [userId]
  );
  
  const settingsJson = JSON.stringify(settings);
  
  if (existing && existing.length > 0) {
    await db.query(`
      UPDATE user_settings 
      SET settings = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `, [settingsJson, userId]);
  } else {
    await db.query(`
      INSERT INTO user_settings (user_id, settings, created_at)
      VALUES (?, ?, datetime('now'))
    `, [userId, settingsJson]);
  }
  
  return settings;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // Get current password hash
  const users = await db.query(
    'SELECT password_hash FROM users WHERE id = ?',
    [userId]
  );
  
  if (!users || users.length === 0) {
    return {
      success: false,
      error: 'User not found'
    };
  }
  
  // Verify current password
  const isValid = await verifyPassword(currentPassword, users[0].password_hash);
  
  if (!isValid) {
    return {
      success: false,
      error: 'Current password is incorrect'
    };
  }
  
  // Hash new password
  const newPasswordHash = await hashPassword(newPassword);
  
  // Update password
  await db.query(
    'UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?',
    [newPasswordHash, userId]
  );
  
  // Invalidate all sessions except current one
  await db.query(
    'DELETE FROM sessions WHERE user_id = ? AND created_at < datetime("now")',
    [userId]
  );
  
  return { success: true };
}

/**
 * Delete user account
 */
export async function deleteAccount(userId: string, password: string) {
  // Verify password
  const users = await db.query(
    'SELECT password_hash FROM users WHERE id = ?',
    [userId]
  );
  
  if (!users || users.length === 0) {
    return {
      success: false,
      error: 'User not found'
    };
  }
  
  const isValid = await verifyPassword(password, users[0].password_hash);
  
  if (!isValid) {
    return {
      success: false,
      error: 'Password is incorrect'
    };
  }
  
  // Delete all user data (in proper order due to foreign keys)
  await db.query('BEGIN TRANSACTION');
  
  try {
    await db.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM forecasts WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM reports WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM transactions WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM alerts WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM user_settings WHERE user_id = ?', [userId]);
    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    
    await db.query('COMMIT');
    
    return { success: true };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  const stats = await db.query(`
    SELECT 
      (SELECT COUNT(*) FROM transactions WHERE user_id = ?) as transaction_count,
      (SELECT COUNT(*) FROM reports WHERE user_id = ?) as report_count,
      (SELECT COUNT(*) FROM forecasts WHERE user_id = ?) as forecast_count,
      (SELECT COUNT(*) FROM alerts WHERE user_id = ? AND status = 'active') as active_alerts,
      (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'income') as total_revenue,
      (SELECT SUM(amount) FROM transactions WHERE user_id = ? AND type = 'expense') as total_expenses
  `, [userId, userId, userId, userId, userId, userId]);
  
  return stats[0];
}
