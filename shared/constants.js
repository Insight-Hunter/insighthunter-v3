// shared/constants.js
// Shared constants and configuration across all Workers

export const API_VERSION = ‘v1’;

export const CORS_HEADERS = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Methods’: ‘GET, POST, PUT, DELETE, OPTIONS’,
‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’,
‘Access-Control-Max-Age’: ‘86400’
};

export const REPORT_TYPES = {
PROFIT_LOSS: ‘profit_loss’,
BALANCE_SHEET: ‘balance_sheet’,
CASH_FLOW: ‘cash_flow’,
EXPENSE_SUMMARY: ‘expense_summary’,
REVENUE_ANALYSIS: ‘revenue_analysis’
};

export const TRANSACTION_TYPES = {
INCOME: ‘income’,
EXPENSE: ‘expense’,
TRANSFER: ‘transfer’,
ADJUSTMENT: ‘adjustment’
};

export const TRANSACTION_CATEGORIES = {
// Income categories
INCOME_SALES: ‘Sales’,
INCOME_SERVICES: ‘Services’,
INCOME_INTEREST: ‘Interest’,
INCOME_OTHER: ‘Other Income’,

// Expense categories
EXPENSE_PAYROLL: ‘Payroll’,
EXPENSE_RENT: ‘Rent’,
EXPENSE_UTILITIES: ‘Utilities’,
EXPENSE_MARKETING: ‘Marketing’,
EXPENSE_SUPPLIES: ‘Supplies’,
EXPENSE_INSURANCE: ‘Insurance’,
EXPENSE_TRAVEL: ‘Travel’,
EXPENSE_MEALS: ‘Meals & Entertainment’,
EXPENSE_SOFTWARE: ‘Software & Subscriptions’,
EXPENSE_PROFESSIONAL: ‘Professional Services’,
EXPENSE_OTHER: ‘Other Expenses’
};

export const FORECAST_TYPES = {
REVENUE: ‘revenue’,
EXPENSES: ‘expenses’,
CASH_FLOW: ‘cash_flow’,
PROFIT: ‘profit’
};

export const ALERT_TYPES = {
CASH_FLOW_WARNING: ‘cash_flow_warning’,
EXPENSE_SPIKE: ‘expense_spike’,
REVENUE_DROP: ‘revenue_drop’,
PAYMENT_DUE: ‘payment_due’,
BUDGET_EXCEEDED: ‘budget_exceeded’,
FORECAST_ALERT: ‘forecast_alert’
};

export const ALERT_SEVERITY = {
INFO: ‘info’,
WARNING: ‘warning’,
CRITICAL: ‘critical’
};

export const DATE_RANGES = {
LAST_7_DAYS: ‘last_7_days’,
LAST_30_DAYS: ‘last_30_days’,
LAST_90_DAYS: ‘last_90_days’,
THIS_MONTH: ‘this_month’,
LAST_MONTH: ‘last_month’,
THIS_QUARTER: ‘this_quarter’,
LAST_QUARTER: ‘last_quarter’,
THIS_YEAR: ‘this_year’,
LAST_YEAR: ‘last_year’,
CUSTOM: ‘custom’
};

export const FILE_SIZE_LIMITS = {
CSV_MAX_SIZE: 10 * 1024 * 1024, // 10 MB
PDF_MAX_SIZE: 5 * 1024 * 1024   // 5 MB
};

export const CSV_REQUIRED_COLUMNS = {
TRANSACTIONS: [‘date’, ‘description’, ‘amount’],
PROFIT_LOSS: [‘category’, ‘amount’],
BALANCE_SHEET: [‘account’, ‘balance’]
};

export const HTTP_STATUS = {
OK: 200,
CREATED: 201,
NO_CONTENT: 204,
BAD_REQUEST: 400,
UNAUTHORIZED: 401,
FORBIDDEN: 403,
NOT_FOUND: 404,
CONFLICT: 409,
TOO_MANY_REQUESTS: 429,
INTERNAL_ERROR: 500
};

export const ERROR_MESSAGES = {
UNAUTHORIZED: ‘Authentication required’,
INVALID_TOKEN: ‘Invalid or expired token’,
FORBIDDEN: ‘You do not have permission to perform this action’,
NOT_FOUND: ‘Resource not found’,
INVALID_INPUT: ‘Invalid input data’,
PLAN_LIMIT_REACHED: ‘Plan limit reached. Please upgrade your plan.’,
FILE_TOO_LARGE: ‘File size exceeds maximum allowed size’,
INVALID_FILE_FORMAT: ‘Invalid file format’,
DATABASE_ERROR: ‘Database operation failed’,
RATE_LIMIT_EXCEEDED: ‘Too many requests. Please try again later.’
};

export const SUCCESS_MESSAGES = {
USER_CREATED: ‘User created successfully’,
LOGIN_SUCCESS: ‘Login successful’,
LOGOUT_SUCCESS: ‘Logout successful’,
DATA_UPLOADED: ‘Data uploaded successfully’,
REPORT_GENERATED: ‘Report generated successfully’,
FORECAST_CREATED: ‘Forecast created successfully’,
CLIENT_ADDED: ‘Client added successfully’,
SETTINGS_UPDATED: ‘Settings updated successfully’
};

/**

- Get date range boundaries
- @param {string} range - Date range constant
- @returns {object} - { start: Date, end: Date }
  */
  export function getDateRangeBoundaries(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

switch (range) {
case DATE_RANGES.LAST_7_DAYS:
return {
start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
end: today
};

```
case DATE_RANGES.LAST_30_DAYS:
  return {
    start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
    end: today
  };

case DATE_RANGES.LAST_90_DAYS:
  return {
    start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000),
    end: today
  };

case DATE_RANGES.THIS_MONTH:
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: today
  };

case DATE_RANGES.LAST_MONTH:
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  return { start: lastMonthStart, end: lastMonthEnd };

case DATE_RANGES.THIS_QUARTER:
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  return { start: quarterStart, end: today };

case DATE_RANGES.LAST_QUARTER:
  const lastQuarterMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
  const lastQuarterStart = new Date(now.getFullYear(), lastQuarterMonth, 1);
  const lastQuarterEnd = new Date(now.getFullYear(), lastQuarterMonth + 3, 0);
  return { start: lastQuarterStart, end: lastQuarterEnd };

case DATE_RANGES.THIS_YEAR:
  return {
    start: new Date(now.getFullYear(), 0, 1),
    end: today
  };

case DATE_RANGES.LAST_YEAR:
  return {
    start: new Date(now.getFullYear() - 1, 0, 1),
    end: new Date(now.getFullYear() - 1, 11, 31)
  };

default:
  return { start: today, end: today };
```

}
}

/**

- Format currency value
- @param {number} amount - Amount to format
- @param {string} currency - Currency code (default: USD)
- @returns {string} - Formatted currency string
  */
  export function formatCurrency(amount, currency = ‘USD’) {
  return new Intl.NumberFormat(‘en-US’, {
  style: ‘currency’,
  currency: currency
  }).format(amount);
  }

/**

- Format percentage value
- @param {number} value - Value to format
- @param {number} decimals - Number of decimal places
- @returns {string} - Formatted percentage string
  */
  export function formatPercentage(value, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
  }
