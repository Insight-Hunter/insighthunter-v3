– Users table
CREATE TABLE users (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
name TEXT NOT NULL,
plan TEXT DEFAULT ‘free’ NOT NULL CHECK(plan IN (‘free’, ‘starter’, ‘professional’, ‘enterprise’)),
plan_started_at INTEGER,
plan_ends_at INTEGER,
organization_id TEXT,
created_at INTEGER DEFAULT (unixepoch()),
updated_at INTEGER DEFAULT (unixepoch()),
deleted_at INTEGER
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);

– Clients table
CREATE TABLE clients (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
user_id TEXT NOT NULL,
name TEXT NOT NULL,
email TEXT,
company TEXT,
portal_access INTEGER DEFAULT 0,
portal_token TEXT UNIQUE,
created_at INTEGER DEFAULT (unixepoch()),
updated_at INTEGER DEFAULT (unixepoch()),
deleted_at INTEGER,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_portal_token ON clients(portal_token);

– Transactions table
CREATE TABLE transactions (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
client_id TEXT NOT NULL,
date INTEGER NOT NULL,
description TEXT NOT NULL,
amount REAL NOT NULL,
type TEXT NOT NULL CHECK(type IN (‘income’, ‘expense’, ‘transfer’, ‘adjustment’)),
category TEXT,
confidence REAL DEFAULT 1.0,
ai_categorized INTEGER DEFAULT 0,
embedding_id TEXT,
raw_data TEXT,
created_at INTEGER DEFAULT (unixepoch()),
updated_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_client_id ON transactions(client_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_embedding ON transactions(embedding_id);

– Reports table
CREATE TABLE reports (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
client_id TEXT NOT NULL,
user_id TEXT NOT NULL,
type TEXT NOT NULL CHECK(type IN (‘profit_loss’, ‘balance_sheet’, ‘cash_flow’, ‘expense_summary’, ‘revenue_analysis’)),
data TEXT NOT NULL,
period_start INTEGER,
period_end INTEGER,
ai_generated INTEGER DEFAULT 0,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_created_at ON reports(created_at);

– Forecasts table
CREATE TABLE forecasts (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
client_id TEXT NOT NULL,
type TEXT NOT NULL CHECK(type IN (‘revenue’, ‘expenses’, ‘cash_flow’, ‘profit’)),
predictions TEXT NOT NULL,
confidence TEXT,
period_months INTEGER NOT NULL,
model_used TEXT DEFAULT ‘llama-3.1-8b’,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_forecasts_client_id ON forecasts(client_id);
CREATE INDEX idx_forecasts_type ON forecasts(type);

– CSV Uploads table
CREATE TABLE csv_uploads (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
user_id TEXT NOT NULL,
client_id TEXT NOT NULL,
filename TEXT NOT NULL,
row_count INTEGER,
file_size INTEGER,
storage_path TEXT,
r2_key TEXT,
processed INTEGER DEFAULT 0,
processed_at INTEGER,
transactions_created INTEGER DEFAULT 0,
uploaded_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_csv_uploads_user_id ON csv_uploads(user_id);
CREATE INDEX idx_csv_uploads_client_id ON csv_uploads(client_id);
CREATE INDEX idx_csv_uploads_uploaded_at ON csv_uploads(uploaded_at);

– Alerts table
CREATE TABLE alerts (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
user_id TEXT NOT NULL,
client_id TEXT,
type TEXT NOT NULL,
severity TEXT NOT NULL CHECK(severity IN (‘info’, ‘warning’, ‘critical’)),
message TEXT NOT NULL,
data TEXT,
ai_generated INTEGER DEFAULT 0,
read INTEGER DEFAULT 0,
read_at INTEGER,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_client_id ON alerts(client_id);
CREATE INDEX idx_alerts_read ON alerts(read);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);

– AI Insights Cache table (stores AI-generated insights for quick retrieval)
CREATE TABLE ai_insights_cache (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
client_id TEXT NOT NULL,
insight_type TEXT NOT NULL,
date_range_start INTEGER,
date_range_end INTEGER,
insights TEXT NOT NULL,
model_used TEXT DEFAULT ‘llama-3.1-8b’,
expires_at INTEGER NOT NULL,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_cache_client ON ai_insights_cache(client_id);
CREATE INDEX idx_ai_cache_expires ON ai_insights_cache(expires_at);

– Vector Metadata table (links transactions to Vectorize embeddings)
CREATE TABLE vector_metadata (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
transaction_id TEXT NOT NULL UNIQUE,
vector_id TEXT NOT NULL,
embedding_model TEXT DEFAULT ‘bge-base-en-v1.5’,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
);

CREATE INDEX idx_vector_transaction ON vector_metadata(transaction_id);
CREATE INDEX idx_vector_id ON vector_metadata(vector_id);

– API Keys table (for API access)
CREATE TABLE api_keys (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
user_id TEXT NOT NULL,
key_hash TEXT NOT NULL,
name TEXT,
last_used_at INTEGER,
expires_at INTEGER,
revoked INTEGER DEFAULT 0,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

– Organizations table (for multi-user teams)
CREATE TABLE organizations (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
name TEXT NOT NULL,
plan TEXT DEFAULT ‘free’,
created_at INTEGER DEFAULT (unixepoch()),
updated_at INTEGER DEFAULT (unixepoch())
);

– Organization Members table
CREATE TABLE organization_members (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
organization_id TEXT NOT NULL,
user_id TEXT NOT NULL,
role TEXT DEFAULT ‘member’ CHECK(role IN (‘owner’, ‘admin’, ‘member’)),
joined_at INTEGER DEFAULT (unixepoch()),
UNIQUE(organization_id, user_id),
FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

– Audit Log table
CREATE TABLE audit_log (
id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
user_id TEXT,
action TEXT NOT NULL,
resource_type TEXT,
resource_id TEXT,
changes TEXT,
ip_address TEXT,
user_agent TEXT,
created_at INTEGER DEFAULT (unixepoch()),
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_resource ON audit_log(resource_type, resource_id);

– Triggers for updated_at timestamps
CREATE TRIGGER update_users_timestamp
AFTER UPDATE ON users
BEGIN
UPDATE users SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TRIGGER update_clients_timestamp
AFTER UPDATE ON clients
BEGIN
UPDATE clients SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TRIGGER update_transactions_timestamp
AFTER UPDATE ON transactions
BEGIN
UPDATE transactions SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TRIGGER update_organizations_timestamp
AFTER UPDATE ON organizations
BEGIN
UPDATE organizations SET updated_at = unixepoch() WHERE id = NEW.id;
END;

– Views for common queries

– Monthly transaction summary view
CREATE VIEW monthly_transaction_summary AS
SELECT
client_id,
strftime(’%Y-%m’, datetime(date, ‘unixepoch’)) as month,
type,
category,
COUNT(*) as transaction_count,
SUM(amount) as total_amount
FROM transactions
WHERE deleted_at IS NULL
GROUP BY client_id, month, type, category;

– Client financial overview view
CREATE VIEW client_financial_overview AS
SELECT
c.id as client_id,
c.name as client_name,
c.user_id,
COUNT(DISTINCT t.id) as total_transactions,
SUM(CASE WHEN t.type = ‘income’ THEN t.amount ELSE 0 END) as total_income,
SUM(CASE WHEN t.type = ‘expense’ THEN t.amount ELSE 0 END) as total_expenses,
SUM(CASE WHEN t.type = ‘income’ THEN t.amount WHEN t.type = ‘expense’ THEN -t.amount ELSE 0 END) as net_income,
MAX(t.date) as last_transaction_date
FROM clients c
LEFT JOIN transactions t ON c.id = t.client_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.user_id;

– AI categorization accuracy view
CREATE VIEW ai_categorization_stats AS
SELECT
client_id,
category,
COUNT(*) as total_transactions,
SUM(CASE WHEN ai_categorized = 1 THEN 1 ELSE 0 END) as ai_categorized_count,
AVG(CASE WHEN ai_categorized = 1 THEN confidence ELSE NULL END) as avg_ai_confidence
FROM transactions
GROUP BY client_id, category;

– Comments for documentation
– D1 Notes:
– - Uses INTEGER for timestamps (Unix epoch)
– - TEXT for JSON storage (no native JSON type)
– - randomblob(16) for UUID generation
– - CHECK constraints for enums
– - Foreign keys supported
– - Triggers for auto-timestamps
– - Views for complex queries
