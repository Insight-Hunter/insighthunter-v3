// backend/src/routes/auth.ts
// Authentication API Routes

import { Router } from 'express';
import { 
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  validateSession
} from '../services/authServices';
import { validateAuth } from '../middlewares/validation';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateToken, verifyToken } from '../utils/jwt';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, companyName } = req.body;
    
    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }
    
    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (existingUser && existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }
    
    // Register user
    const result = await registerUser({
      email: email.toLowerCase(),
      password,
      name,
      companyName
    });
    
    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user'
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Get user from database
    const users = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    
    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    const user = users[0];
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Check if email is verified (optional)
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email before logging in'
      });
    }
    
    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    
    // Create session
    await db.query(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, datetime('now', '+7 days'))
    `, [user.id, token]);
    
    // Update last login
    await db.query(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Delete session
    await db.query(
      'DELETE FROM sessions WHERE user_id = ? AND token = ?',
      [userId, token]
    );
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh authentication token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }
    
    // Verify old token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
    
    // Check if session exists
    const sessions = await db.query(
      'SELECT * FROM sessions WHERE user_id = ? AND token = ?',
      [decoded.userId, token]
    );
    
    if (!sessions || sessions.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Session not found'
      });
    }
    
    // Generate new token
    const newToken = await generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });
    
    // Update session
    await db.query(`
      UPDATE sessions 
      SET token = ?, expires_at = datetime('now', '+7 days')
      WHERE user_id = ? AND token = ?
    `, [newToken, decoded.userId, token]);
    
    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required'
      });
    }
    
    const result = await requestPasswordReset(email.toLowerCase());
    
    // Always return success to prevent email enumeration
    res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request'
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters'
      });
    }
    
    const result = await resetPassword(token, newPassword);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Invalid or expired reset token'
      });
    }
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password'
    });
  }
});

/**
 * GET /api/auth/verify-email/:token
 * Verify email address
 */
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const result = await verifyEmail(token);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }
    
    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const users = await db.query(
      'SELECT id, email, name, avatar, role, plan, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user'
    });
  }
});

/**
 * POST /api/auth/validate
 * Validate session token
 */
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }
    
    const isValid = await validateSession(token);
    
    res.json({
      success: true,
      data: {
        valid: isValid
      }
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate token'
    });
  }
});

export default router;
