const express = require('express');
const router = express.Router();

// User Signup
router.post('/api/signup', (req, res) => {
  const { email, password, name } = req.body;
  // Hash password, create user in DB, return token and user info
  res.json({ userId: '123', email, token: 'jwt-token' });
});

// User Login
router.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  // Authenticate, return JWT token & user info
  res.json({ token: 'jwt-token', userInfo: { email, name: 'User' } });
});

// Get User Profile
router.get('/api/user/profile', (req, res) => {
  // Auth middleware obtains user ID
  res.json({
    email: 'user@example.com',
    name: 'User',
    preferences: { alertsEnabled: true, reportFrequency: 'weekly' },
    accounts: [{ type: 'quickbooks', status: 'connected' }],
  });
});

// Update User Profile
router.put('/api/user/profile', (req, res) => {
  const preferences = req.body.preferences;
  // Update DB preferences for user
  res.json({ success: true });
});

// Account Connect
router.post('/api/accounts/connect', (req, res) => {
  const { accountType } = req.body;
  // Start OAuth flow or direct connection process
  res.json({ connectionId: 'abc123', status: 'pending' });
});

// Account Status
router.get('/api/accounts/status', (req, res) => {
  res.json({ accounts: [{ type: 'quickbooks', status: 'connected' }] });
});

// Account Disconnect
router.delete('/api/accounts/disconnect', (req, res) => {
  const { accountId } = req.body;
  // Remove linked account
  res.json({ success: true });
});

// Invoice Upload
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
router.post('/api/invoices/upload', upload.single('file'), (req, res) => {
  const file = req.file; // Process and parse file
  res.json({ uploadId: 'invoice123', status: 'uploaded' });
});

// Get Invoices
router.get('/api/invoices', (req, res) => {
  res.json([{ invoiceId: '1', details: { amount: 100, dueDate: '2025-10-01' } }]);
});

// Update Invoice Settings
router.put('/api/invoices/settings', (req, res) => {
  const { categories, reminders } = req.body;
  // Save invoice preferences
  res.json({ success: true });
});

// Wallet Connect
router.post('/api/wallets/connect', (req, res) => {
  const { walletType } = req.body;
  // Handle wallet connection
  res.json({ walletId: 'wallet123', status: 'connected' });
});

// Wallet Status
router.get('/api/wallets/status', (req, res) => {
  res.json({ wallets: [{ walletType: 'paypal', status: 'connected' }] });
});

// Wallet Disconnect
router.delete('/api/wallets/disconnect', (req, res) => {
  const { walletId } = req.body;
  // Remove wallet link
  res.json({ success: true });
});

// Notifications Preferences
router.get('/api/notifications/preferences', (req, res) => {
  res.json({ alertsEnabled: true, types: ['cashflow', 'kpi'] });
});

router.put('/api/notifications/preferences', (req, res) => {
  res.json({ success: true });
});

// Onboarding Status
router.get('/api/onboarding/status', (req, res) => {
  res.json({ step: 'invoice_setup' });
});

router.post('/api/onboarding/complete', (req, res) => {
  res.json({ success: true });
});

module.exports = router;
