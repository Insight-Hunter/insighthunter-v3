// ============================================================================
// CSV PARSING
// Parse CSV content and validate structure
// ============================================================================

// workers/ingest/csv-parser.js
// CSV parsing and validation logic

import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES } from ‘../../shared/constants.js’;

/**

- Parse CSV content
- @param {string} content - CSV file content
- @returns {Promise<object>} - { success: boolean, data: array, error: string }
  */
  export async function parseCSV(content) {
  try {
  const lines = content.split(’\n’).filter(line => line.trim());
  
  if (lines.length < 2) {
  return {
  success: false,
  error: ‘CSV file must have at least a header row and one data row’
  };
  }
  
  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
  
  // Parse data rows
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
  
  return {
  success: true,
  data,
  headers
  };

} catch (error) {
return {
success: false,
error: error.message
};
}
}

/**

- Parse a single CSV line handling quoted values
- @param {string} line - CSV line
- @returns {array} - Array of values
  */
  function parseCSVLine(line) {
  const result = [];
  let current = ‘’;
  let inQuotes = false;

for (let i = 0; i < line.length; i++) {
const char = line[i];
const nextChar = line[i + 1];


if (char === '"') {
  if (inQuotes && nextChar === '"') {
    current += '"';
    i++; // Skip next quote
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

- Validate transaction CSV structure
- @param {array} data - Parsed CSV data
- @returns {object} - { valid: boolean, errors: array }
  */
  export function validateTransactionCSV(data) {
  const errors = [];

if (!data || data.length === 0) {
errors.push(‘CSV file is empty’);
return { valid: false, errors };
}

const firstRow = data[0];
const headers = Object.keys(firstRow);

// Check for required columns (flexible matching)
const hasDate = headers.some(h =>
h.includes(‘date’) || h.includes(‘timestamp’) || h.includes(‘posted’)
);

const hasAmount = headers.some(h =>
h.includes(‘amount’) || h.includes(‘value’) || h.includes(‘total’)
);

const hasDescription = headers.some(h =>
h.includes(‘description’) || h.includes(‘memo’) || h.includes(‘payee’) || h.includes(‘name’)
);

if (!hasDate) {
errors.push(‘CSV must have a date column (e.g., “date”, “posted date”, “timestamp”)’);
}

if (!hasAmount) {
errors.push(‘CSV must have an amount column (e.g., “amount”, “value”, “total”)’);
}

if (!hasDescription) {
errors.push(‘CSV should have a description column (e.g., “description”, “memo”, “payee”)’);
}

// Validate data types in sample rows
const sampleSize = Math.min(5, data.length);
for (let i = 0; i < sampleSize; i++) {
const row = data[i];


// Check if date columns contain valid dates
const dateColumn = headers.find(h => h.includes('date') || h.includes('timestamp'));
if (dateColumn && row[dateColumn]) {
  const date = parseDate(row[dateColumn]);
  if (!date) {
    errors.push(`Invalid date format in row ${i + 2}: "${row[dateColumn]}"`);
    break;
  }
}

// Check if amount columns contain valid numbers
const amountColumn = headers.find(h => h.includes('amount') || h.includes('value'));
if (amountColumn && row[amountColumn]) {
  const amount = parseAmount(row[amountColumn]);
  if (isNaN(amount)) {
    errors.push(`Invalid amount format in row ${i + 2}: "${row[amountColumn]}"`);
    break;
  }
}


}

return {
valid: errors.length === 0,
errors
};
}

/**

- Normalize transaction data from CSV
- @param {array} data - Parsed CSV data
- @param {string} clientId - Client ID
- @param {object} columnMapping - Custom column mapping (optional)
- @returns {array} - Normalized transaction objects
  */
  export function normalizeTransactionData(data, clientId, columnMapping = null) {
  const transactions = [];
  const headers = Object.keys(data[0]);

// Auto-detect or use provided column mapping
const mapping = columnMapping || detectColumnMapping(headers);

for (const row of data) {
try {
const date = parseDate(row[mapping.date]);
if (!date) continue; // Skip invalid dates


  const amount = parseAmount(row[mapping.amount]);
  if (isNaN(amount)) continue; // Skip invalid amounts

  const description = row[mapping.description] || 'Unknown';
  
  // Determine transaction type
  let type = TRANSACTION_TYPES.EXPENSE;
  let finalAmount = Math.abs(amount);

  if (mapping.type && row[mapping.type]) {
    const typeValue = row[mapping.type].toLowerCase();
    if (typeValue.includes('credit') || typeValue.includes('deposit') || typeValue.includes('income')) {
      type = TRANSACTION_TYPES.INCOME;
    }
  } else {
    // Infer from amount sign
    if (amount > 0) {
      type = TRANSACTION_TYPES.INCOME;
    }
  }

  // Detect category
  const category = detectCategory(description, type);

  transactions.push({
    client_id: clientId,
    date: date.toISOString(),
    description,
    amount: finalAmount,
    type,
    category,
    raw_data: row,
    created_at: new Date().toISOString()
  });

} catch (error) {
  console.error('Error normalizing transaction:', error);
  continue; // Skip problematic rows
}


}

return transactions;
}

/**

- Auto-detect column mapping from headers
- @param {array} headers - CSV headers
- @returns {object} - Column mapping
  */
  function detectColumnMapping(headers) {
  const mapping = {
  date: null,
  amount: null,
  description: null,
  type: null,
  category: null
  };

headers.forEach(header => {
const lower = header.toLowerCase();


if (!mapping.date && (lower.includes('date') || lower.includes('timestamp') || lower.includes('posted'))) {
  mapping.date = header;
}

if (!mapping.amount && (lower.includes('amount') || lower.includes('value') || lower.includes('total'))) {
  mapping.amount = header;
}

if (!mapping.description && (lower.includes('description') || lower.includes('memo') || lower.includes('payee') || lower.includes('name'))) {
  mapping.description = header;
}

if (!mapping.type && (lower.includes('type') || lower.includes('transaction type') || lower.includes('debit/credit'))) {
  mapping.type = header;
}

if (!mapping.category && lower.includes('category')) {
  mapping.category = header;
}


});

return mapping;
}

/**

- Parse date from various formats
- @param {string} dateString - Date string
- @returns {Date|null} - Parsed date or null
  */
  function parseDate(dateString) {
  if (!dateString) return null;

// Try ISO format first
let date = new Date(dateString);
if (!isNaN(date.getTime())) {
return date;
}

// Try common formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
const formats = [
/^(\d{1,2})/(\d{1,2})/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
/^(\d{4})-(\d{1,2})-(\d{1,2})$/,   // YYYY-MM-DD
/^(\d{1,2})-(\d{1,2})-(\d{4})$/    // DD-MM-YYYY or MM-DD-YYYY
];

for (const format of formats) {
const match = dateString.match(format);
if (match) {
date = new Date(dateString);
if (!isNaN(date.getTime())) {
return date;
}
}
}

return null;
}

/**

- Parse amount from string
- @param {string} amountString - Amount string
- @returns {number} - Parsed amount
  */
  function parseAmount(amountString) {
  if (typeof amountString === ‘number’) {
  return amountString;
  }

if (!amountString) return 0;

// Remove currency symbols and spaces
let cleaned = amountString.toString()
.replace(/[$€£¥,\s]/g, ‘’)
.replace(/[()]/g, ‘’); // Remove parentheses

// Handle negative amounts in parentheses
if (amountString.includes(’(’) && amountString.includes(’)’)) {
cleaned = ‘-’ + cleaned;
}

return parseFloat(cleaned);
}

/**

- Detect transaction category from description
- @param {string} description - Transaction description
- @param {string} type - Transaction type
- @returns {string} - Detected category
  */
  function detectCategory(description, type) {
  const lower = description.toLowerCase();

if (type === TRANSACTION_TYPES.INCOME) {
if (lower.includes(‘paypal’) || lower.includes(‘stripe’) || lower.includes(‘payment’)) {
return TRANSACTION_CATEGORIES.INCOME_SALES;
}
if (lower.includes(‘service’) || lower.includes(‘consulting’)) {
return TRANSACTION_CATEGORIES.INCOME_SERVICES;
}
if (lower.includes(‘interest’)) {
return TRANSACTION_CATEGORIES.INCOME_INTEREST;
}
return TRANSACTION_CATEGORIES.INCOME_OTHER;
}

// Expense categories
if (lower.includes(‘payroll’) || lower.includes(‘salary’) || lower.includes(‘wage’)) {
return TRANSACTION_CATEGORIES.EXPENSE_PAYROLL;
}
if (lower.includes(‘rent’) || lower.includes(‘lease’)) {
return TRANSACTION_CATEGORIES.EXPENSE_RENT;
}
if (lower.includes(‘utility’) || lower.includes(‘electric’) || lower.includes(‘water’)
