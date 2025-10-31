// backend/src/services/authServices.ts
// Authentication Business Logic

import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';
import { db } from '../utils/db';
import crypto from 'crypto';

/**
 * Register a new user
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}) {
  const passwordHash = await hashPassword(data.password);
  const userId = crypto.randomUUID();
  const companyId = data.companyName ? crypto.randomUUID() : null;
  
  // Start transaction
  await db.query('BEGIN TRANSACTION');
  
  try {
    // Create company if provided
    if (data.companyName && companyId) {
      await db.query(`
        INSERT INTO companies (id, name, created_at)
        VALUES (?, ?, datetime('now'))
      `, [companyId, data.companyName]);
    }
    
    // Create user
    await db.query(`
      INSERT INTO users (
        id, email, password_hash, name, company_id, 
        role, plan, email_verified, created_at
      )
      VALUES (?, ?, ?, ?, ?, 'owner', 'free', 0, datetime('now'))
    `, [userId, data.email, passwordHash, data.name, companyId]);
    
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await db.query(`
      INSERT INTO email_verifications (user_id, token, expires_at)
      VALUES (?, ?, datetime('now', '+24 hours'))
    `, [userId, verificationToken]);
    
    // TODO: Send verification email
    // await sendVerificationEmail(data.email, verificationToken);
    
    await db.query('COMMIT');
    
    // Generate JWT token
    const token = await generateToken({
      userId,
      email: data.email,
      role: 'owner'
    });
    
    // Create session
    await db.query(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, datetime('now', '+7 days'))
    `, [userId, token]);
    
    return {
      success: true,
      user: {
        id: userId,
        email: data.email,
        name: data.name,
        companyId,
        role: 'owner',
        plan: 'free'
      },
      token
    };
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const users = await db.query(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );
  
  if (!users || users.length === 0) {
    // Return success anyway to prevent email enumeration
    return { success: true };
  }
  
  const userId = users[0].id;
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Store reset token
  await db.query(`
    INSERT INTO password_resets (user_id, token, expires_at)
    VALUES (?, ?, datetime('now', '+1 hour'))
  `, [userId, resetToken]);
  
  // TODO: Send reset email
  // await sendPasswordResetEmail(email, resetToken);
  
  return { success: true };
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string) {
  const resets = await db.query(`
    SELECT user_id, expires_at FROM password_resets
    WHERE token = ? AND used = 0
  `, [token]);
  
  if (!resets || resets.length === 0) {
    return {
      success: false,
      error: 'Invalid or expired reset token'
    };
  }
  
  const reset = resets[0];
  const expiresAt = new Date(reset.expires_at);
  
  if (expiresAt < new Date()) {
    return {
      success: false,
      error: 'Reset token has expired'
    };
  }
  
  const passwordHash = await hashPassword(newPassword);
  
  // Update password
  await db.query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [passwordHash, reset.user_id]
  );
  
  // Mark token as used
  await db.query(
    'UPDATE password_resets SET used = 1 WHERE token = ?',
    [token]
  );
  
  // Invalidate all sessions for this user
  await db.query(
    'DELETE FROM sessions WHERE user_id = ?',
    [reset.user_id]
  );
  
  return { success: true };
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string) {
  const verifications = await db.query(`
    SELECT user_id, expires_at FROM email_verifications
    WHERE token = ? AND used = 0
  `, [token]);
  
  if (!verifications || verifications.length === 0) {
    return {
      success: false,
      error: 'Invalid or expired verification token'
    };
  }
  
  const verification = verifications[0];
  const expiresAt = new Date(verification.expires_at);
  
  if (expiresAt < new Date()) {
    return {
      success: false,
      error: 'Verification token has expired'
    };
  }
  
  // Update user
  await db.query(
    'UPDATE users SET email_verified = 1 WHERE id = ?',
    [verification.user_id]
  );
  
  // Mark token as used
  await db.query(
    'UPDATE email_verifications SET used = 1 WHERE token = ?',
    [token]
  );
  
  return { success: true };
}

/**
 * Validate session token
 */
export async function validateSession(token: string) {
  try {
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return false;
    }
    
    const sessions = await db.query(`
      SELECT * FROM sessions
      WHERE user_id = ? AND token = ? AND expires_at > datetime('now')
    `, [decoded.userId, token]);
    
    return sessions && sessions.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Login user (alternative implementation)
 */
export async function loginUser(email: string, password: string) {
  const users = await db.query(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  
  if (!users || users.length === 0) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
  
  const user = users[0];
  const isValidPassword = await verifyPassword(password, user.password_hash);
  
  if (!isValidPassword) {
    return {
      success: false,
      error: 'Invalid email or password'
    };
  }
  
  const token = await generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });
  
  await db.query(`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, datetime('now', '+7 days'))
  `, [user.id, token]);
  
  delete user.password_hash;
  
  return {
    success: true,
    user,
    token
  };
}

/**
 * Logout user
 */
export async function logoutUser(userId: string, token: string) {
  await db.query(
    'DELETE FROM sessions WHERE user_id = ? AND token = ?',
    [userId, token]
  );
  
  return { success: true };
}

/**
 * Refresh authentication token
 */
export async function refreshToken(oldToken: string) {
  const decoded = await verifyToken(oldToken);
  
  if (!decoded) {
    return {
      success: false,
      error: 'Invalid token'
    };
  }
  
  const newToken = await generateToken({
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role
  });
  
  await db.query(`
    UPDATE sessions 
    SET token = ?, expires_at = datetime('now', '+7 days')
    WHERE user_id = ? AND token = ?
  `, [newToken, decoded.userId, oldToken]);
  
  return {
    success: true,
    token: newToken
  };
}
