// ============================================================================
// CSV PARSING MODULE
// Parse and validate transaction CSV files
// workers/ingest/csv-parser.js
// ============================================================================

import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from '../../shared/constants.ts'};

/**
 * Parse CSV content
 * @param {string} content
 * @returns {Promise<{success: boolean, data?: Array, headers?: Array, error?: string}>}
 */
export async function parseCSV(content) {
  try {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { success: false, error: 'CSV file must have at least a header row and one data row' };
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index].trim();
        });
        data.push(row);
      }
    }

    return { success: true, data, headers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line
 * @returns {Array<string>}
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Validate transaction CSV structure
 * @param {Array<object>} data
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateTransactionCSV(data) {
  const errors = [];
  if (!data || data.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  const headers = Object.keys(data[0]);
  const hasDate = headers.some(h => h.includes('date') || h.includes('timestamp') || h.includes('posted'));
  const hasAmount = headers.some(h => h.includes('amount') || h.includes('value') || h.includes('total'));
  const hasDescription = headers.some(h =>
    h.includes('description') || h.includes('memo') || h.includes('payee') || h.includes('name')
  );

  if (!hasDate) errors.push('Missing date column');
  if (!hasAmount) errors.push('Missing amount column');
  if (!hasDescription) errors.push('Missing description column');

  // Validate sample rows
  const sampleSize = Math.min(5, data.length);
  for (let i = 0; i < sampleSize; i++) {
    const row = data[i];

    const dateColumn = headers.find(h => h.includes('date') || h.includes('timestamp'));
    if (dateColumn && row[dateColumn]) {
      const date = parseDate(row[dateColumn]);
      if (!date) {
        errors.push(`Invalid date format in row ${i + 2}: "${row[dateColumn]}"`);
        break;
      }
    }

    const amountColumn = headers.find(h => h.includes('amount') || h.includes('value'));
    if (amountColumn && row[amountColumn]) {
      const amount = parseAmount(row[amountColumn]);
      if (isNaN(amount)) {
        errors.push(`Invalid amount format in row ${i + 2}: "${row[amountColumn]}"`);
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalize transaction data from parsed CSV
 * @param {Array<object>} data
 * @param {string} clientId
 * @param {object|null} columnMapping
 * @returns {Array<object>}
 */
export function normalizeTransactionData(data, clientId, columnMapping = null) {
  const transactions = [];
  const headers = Object.keys(data[0]);
  const mapping = columnMapping || detectColumnMapping(headers);

  for (const row of data) {
    try {
      const date = parseDate(row[mapping.date]);
      if (!date) continue;

      const amount = parseAmount(row[mapping.amount]);
      if (isNaN(amount)) continue;

      const description = row[mapping.description] || 'Unknown';

      // Determine type
      let type = TRANSACTION_TYPES.EXPENSE;
      if (mapping.type && row[mapping.type]) {
        const typeValue = row[mapping.type].toLowerCase();
        if (typeValue.includes('credit') || typeValue.includes('deposit') || typeValue.includes('income')) {
          type = TRANSACTION_TYPES.INCOME;
        }
      } else if (amount > 0) {
        type = TRANSACTION_TYPES.INCOME;
      }

      const category = detectCategory(description, type);

      transactions.push({
        client_id: clientId,
        date: date.toISOString(),
        description,
        amount: Math.abs(amount),
        type,
        category,
        raw_data: row,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error normalizing transaction:', error);
    }
  }

  return transactions;
}

/**
 * Auto-detect column mapping
 * @param {Array<string>} headers
 * @returns {object}
 */
function detectColumnMapping(headers) {
  const mapping = { date: null, amount: null, description: null, type: null, category: null };

  headers.forEach(header => {
    const lower = header.toLowerCase();
    if (!mapping.date && (lower.includes('date') || lower.includes('timestamp') || lower.includes('posted'))) mapping.date = header;
    if (!mapping.amount && (lower.includes('amount') || lower.includes('value') || lower.includes('total'))) mapping.amount = header;
    if (!mapping.description && (lower.includes('description') || lower.includes('memo') || lower.includes('payee') || lower.includes('name'))) mapping.description = header;
    if (!mapping.type && (lower.includes('type') || lower.includes('transaction type') || lower.includes('debit/credit'))) mapping.type = header;
    if (!mapping.category && lower.includes('category')) mapping.category = header;
  });

  return mapping;
}

/**
 * Parse date from multiple formats
 * @param {string} dateString
 * @returns {Date|null}
 */
function parseDate(dateString) {
  if (!dateString) return null;

  // ISO first
  let date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;

  // MM/DD/YYYY or DD/MM/YYYY
  let match = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }

  // YYYY-MM-DD
  match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const day = parseInt(match[3], 10);
    date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }

  // DD-MM-YYYY
  match = dateString.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
}

/**
 * Parse amount
 * @param {string|number} amountString
 * @returns {number}
 */
function parseAmount(amountString) {
  if (typeof amountString === 'number') return amountString;
  if (!amountString) return 0;

  let cleaned = amountString.toString().replace(/[$€£¥,\s]/g, '').replace(/[()]/g, '');
  if (amountString.includes('(') && amountString.includes(')')) cleaned = '-' + cleaned;
  return parseFloat(cleaned);
}

/**
 * Detect transaction category from description and type
 * @param {string} description
 * @param {string} type
 * @returns {string}
 */
function detectCategory(description, type) {
  const lower = description.toLowerCase();

  // Income
  if (type === TRANSACTION_TYPES.INCOME) {
    if (lower.includes('paypal') || lower.includes('stripe') || lower.includes('payment'))
      return TRANSACTION_CATEGORIES.INCOME_SALES;
    if (lower.includes('service') || lower.includes('consulting'))
      return TRANSACTION_CATEGORIES.INCOME_SERVICES;
    if (lower.includes('interest'))
      return TRANSACTION_CATEGORIES.INCOME_INTEREST;
    return TRANSACTION_CATEGORIES.INCOME_OTHER;
  }

  // Expense
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('wage'))
    return TRANSACTION_CATEGORIES.EXPENSE_PAYROLL;
  if (lower.includes('rent') || lower.includes('lease'))
    return TRANSACTION_CATEGORIES.EXPENSE_RENT;
  if (lower.includes('utility') || lower.includes('electric') || lower.includes('water'))
    return TRANSACTION_CATEGORIES.EXPENSE_UTILITIES;
  if (lower.includes('marketing') || lower.includes('ad'))
    return TRANSACTION_CATEGORIES.EXPENSE_MARKETING;
  if (lower.includes('software') || lower.includes('subscription'))
    return TRANSACTION_CATEGORIES.EXPENSE_SOFTWARE;
  if (lower.includes('travel') || lower.includes('flight'))
    return TRANSACTION_CATEGORIES.EXPENSE_TRAVEL;
  if (lower.includes('meal') || lower.includes('restaurant'))
    return TRANSACTION_CATEGORIES.EXPENSE_MEALS;
  if (lower.includes('insurance'))
    return TRANSACTION_CATEGORIES.EXPENSE_INSURANCE;
  if (lower.includes('supply'))
    return TRANSACTION_CATEGORIES.EXPENSE_SUPPLIES;
  if (lower.includes('legal') || lower.includes('accounting'))
    return TRANSACTION_CATEGORIES.EXPENSE_PROFESSIONAL;

  return TRANSACTION_CATEGORIES.EXPENSE_OTHER;
}
