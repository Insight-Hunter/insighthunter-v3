-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  plaid_token TEXT,
  stripe_token TEXT,
  qb_token TEXT,
  xero_token TEXT,
  crypto_token TEXT,
  onboarding_complete INTEGER DEFAULT 0
);

-- Businesses linked to users
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  industry TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Transactions for each user
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Invoice Settings
CREATE TABLE IF NOT EXISTS invoice_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  alert_threshold REAL NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
