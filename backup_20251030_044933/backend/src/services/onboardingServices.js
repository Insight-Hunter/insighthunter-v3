var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import db from "../utils/db";
export function savePersonalInfo(data) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!data.name || !data.email)
            throw new Error("Missing required fields");
        yield db.query("INSERT INTO users (name, email) VALUES (?, ?)", [data.name, data.email]);
    });
}
export function saveBusinessSetup(data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("INSERT INTO businesses (user_id, name, type) VALUES (?, ?, ?)", [data.userId, data.businessName, data.businessType]);
    });
}
export function processCsvData(data) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const tx of data.transactions) {
            yield db.query("INSERT INTO transactions (user_id, amount, description) VALUES (?, ?, ?)", [data.userId, tx.amount, tx.description]);
        }
    });
}
export function linkPlaidAccount(userId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("UPDATE users SET plaid_token = ? WHERE id = ?", [token, userId]);
    });
}
export function saveThirdPartyTokens(userId, tokens) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query(`UPDATE users SET stripe_token = ?, qb_token = ?, xero_token = ?, crypto_token = ? WHERE id = ?`, [tokens.stripe, tokens.quickbooks, tokens.xero, tokens.crypto, userId]);
    });
}
export function saveInvoiceSettings(userId, invoiceSettings) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("INSERT INTO invoice_settings (user_id, alert_threshold) VALUES (?, ?)", [userId, invoiceSettings.alertThreshold]);
    });
}
export function markOnboardingComplete(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.query("UPDATE users SET onboarding_complete = 1 WHERE id = ?", [userId]);
        // Additional jobs or notifications can be triggered here
    });
}
