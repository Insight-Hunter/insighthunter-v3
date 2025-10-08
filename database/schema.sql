-- Complete database schema for Insight Hunter
-- Run this with: wrangler d1 execute insighthunter-production --file=schema.sql

-- Users table: stores account information and authentication credentials
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free' CHECK(plan_type IN ('free', 'pro', 'enterprise')),
  created_at TEXT NOT NULL,
  updated_at TEXT
);

-- Create an index on email for faster login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Clients table: represents companies that fractional CFOs manage
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index for quickly finding all clients for a specific user
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);

-- CSV uploads table: tracks all file uploads for audit and debugging
CREATE TABLE IF NOT EXISTS csv_uploads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER,
  filename TEXT NOT NULL,
  file_size INTEGER,
  row_count INTEGER,
  uploaded_at TEXT NOT NULL,
  processed_at TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Transactions table: the core financial data
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER,
  csv_file_id INTEGER,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT,
  category TEXT,
  transaction_type TEXT CHECK(transaction_type IN ('income', 'expense', 'transfer')),
  uploaded_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (csv_file_id) REFERENCES csv_uploads(id) ON DELETE SET NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Forecasts table: stores AI-generated predictions
CREATE TABLE IF NOT EXISTS forecasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER,
  forecast_type TEXT NOT NULL CHECK(forecast_type IN ('revenue', 'expenses', 'cash_flow', 'profit')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  predicted_value REAL NOT NULL,
  confidence_score REAL CHECK(confidence_score BETWEEN 0 AND 1),
  generated_at TEXT NOT NULL,
  model_version TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index for finding forecasts by user and time period
CREATE INDEX IF NOT EXISTS idx_forecasts_user_period ON forecasts(user_id, period_start, period_end);

-- Alerts table: stores notifications and warnings
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  client_id INTEGER,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  read_at TEXT,
  dismissed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Index for quickly finding unread alerts for a user
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread ON alerts(user_id, read_at);
