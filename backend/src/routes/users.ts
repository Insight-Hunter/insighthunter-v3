// backend/src/routes/users.ts
// User Management API Routes

import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  changePassword,
  deleteAccount,
  getUserStats
} from '../services/userServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const profile = await getUserProfile(userId);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, avatar, phone, timezone } = req.body;
    
    const updatedProfile = await updateUserProfile(userId, {
      name,
      avatar,
      phone,
      timezone
    });
    
    res.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/users/settings
 * Get user settings
 */
router.get('/settings', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const settings = await db.query(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      data: settings[0] || {}
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings'
    });
  }
});

/**
 * PUT /api/users/settings
 * Update user settings
 */
router.put('/settings', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const settings = req.body;
    
    const updatedSettings = await updateUserSettings(userId, settings);
    
    res.json({
      success: true,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings'
    });
  }
});

/**
 * POST /api/users/change-password
 * Change user password
 */
router.post('/change-password', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 8 characters'
      });
    }
    
    const result = await changePassword(userId, currentPassword, newPassword);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to change password'
      });
    }
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { password, confirmation } = req.body;
    
    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required'
      });
    }
    
    const result = await deleteAccount(userId, password);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error || 'Failed to delete account'
      });
    }
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account'
    });
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const stats = await getUserStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});

export default router;
