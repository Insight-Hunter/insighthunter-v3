// Hypothetical DB utility import - Replace with actual DB library
import db from "../utils/db";

export async function savePersonalInfo( any) {
  // Example validation
  if (!data.name || !data.email) throw new Error("Missing required fields");
  // Save data to DB
  await db.query("INSERT INTO users (name, email) VALUES (?, ?)", [data.name, data.email]);
}

export async function saveBusinessSetup( any) {
  await db.query("INSERT INTO businesses (user_id, name, type) VALUES (?, ?, ?)", [data.userId, data.businessName, data.businessType]);
}

export async function processCsvData( any) {
  for (const tx of data.transactions) {
    await db.query("INSERT INTO transactions (user_id, amount, description) VALUES (?, ?, ?)", [data.userId, tx.amount, tx.description]);
  }
}

export async function linkPlaidAccount(userId: string, token: string) {
  await db.query("UPDATE users SET plaid_token = ? WHERE id = ?", [token, userId]);
}

export async function saveThirdPartyTokens(userId: string, tokens: any) {
  await db.query(
    `UPDATE users SET stripe_token = ?, qb_token = ?, xero_token = ?, crypto_token = ? WHERE id = ?`,
    [tokens.stripe, tokens.quickbooks, tokens.xero, tokens.crypto, userId]
  );
}

export async function saveInvoiceSettings(userId: string, invoiceSettings: any) {
  await db.query("INSERT INTO invoice_settings (user_id, alert_threshold) VALUES (?, ?)", [userId, invoiceSettings.alertThreshold]);
}

export async function markOnboardingComplete(userId: string) {
  await db.query("UPDATE users SET onboarding_complete = 1 WHERE id = ?", [userId]);
  // Additional jobs can be triggered here
}
