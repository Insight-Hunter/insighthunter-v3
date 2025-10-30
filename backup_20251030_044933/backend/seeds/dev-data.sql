INSERT INTO users (name, email) VALUES ('Alice Johnson', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob Smith', 'bob@example.com');

INSERT INTO businesses (user_id, name, type, industry) VALUES (1, 'Alice Corp', 'LLC', 'Technology');
INSERT INTO businesses (user_id, name, type, industry) VALUES (2, 'Bob LLC', 'LLC', 'Finance');

INSERT INTO transactions (user_id, amount, description) VALUES (1, 150.75, 'Office Supplies');
INSERT INTO transactions (user_id, amount, description) VALUES (2, 2000, 'Software Subscription');

INSERT INTO invoice_settings (user_id, alert_threshold) VALUES (1, 100.00);
INSERT INTO invoice_settings (user_id, alert_threshold) VALUES (2, 150.00);

