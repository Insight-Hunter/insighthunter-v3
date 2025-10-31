// backend/src/services/transactionServices.ts
// Transaction Management Business Logic

import { db } from '../utils/db';
import crypto from 'crypto';

/**
 * Get transactions with filters and pagination
 */
export async function getTransactions(
  userId: string,
  clientId: string | null,
  options: {
    page: number;
    limit: number;
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }
) {
  const offset = (options.page - 1) * options.limit;
  
  let query = `
    SELECT * FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
  `;
  
  const params: any[] = [userId, clientId, clientId];
  
  // Add filters
  if (options.type) {
    query += ' AND type = ?';
    params.push(options.type);
  }
  
  if (options.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }
  
  if (options.startDate) {
    query += ' AND date >= ?';
    params.push(options.startDate);
  }
  
  if (options.endDate) {
    query += ' AND date <= ?';
    params.push(options.endDate);
  }
  
  if (options.search) {
    query += ' AND (description LIKE ? OR category LIKE ?)';
    params.push(`%${options.search}%`, `%${options.search}%`);
  }
  
  // Get total count
  const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
  const countResult = await db.query(countQuery, params);
  const total = countResult[0]?.total || 0;
  
  // Add pagination
  query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
  params.push(options.limit, offset);
  
  const transactions = await db.query(query, params);
  
  return {
    transactions,
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      pages: Math.ceil(total / options.limit)
    }
  };
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  userId: string,
  clientId: string | null,
  data: {
    type: string;
    amount: number;
    category?: string;
    description?: string;
    date: string;
    metadata?: any;
  }
) {
  const transactionId = crypto.randomUUID();
  
  // Get previous balance
  const previousBalance = await getCurrentBalance(userId, clientId);
  
  // Calculate new balance
  const balanceChange = data.type === 'income' ? data.amount : -data.amount;
  const newBalance = previousBalance + balanceChange;
  
  // Auto-categorize if category not provided
  let category = data.category;
  if (!category && data.description) {
    category = await autoCategorize(data.description, data.type);
  }
  
  await db.query(`
    INSERT INTO transactions (
      id, user_id, client_id, type, amount, category,
      description, date, balance, metadata, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, [
    transactionId,
    userId,
    clientId,
    data.type,
    data.amount,
    category || 'Uncategorized',
    data.description || '',
    data.date,
    newBalance,
    JSON.stringify(data.metadata || {})
  ]);
  
  // Check for alerts
  await checkTransactionAlerts(userId, clientId, newBalance, data.amount, data.type);
  
  return {
    id: transactionId,
    userId,
    clientId,
    type: data.type,
    amount: data.amount,
    category: category || 'Uncategorized',
    description: data.description || '',
    date: data.date,
    balance: newBalance,
    metadata: data.metadata || {}
  };
}

/**
 * Update a transaction
 */
export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: {
    amount?: number;
    category?: string;
    description?: string;
    date?: string;
    type?: string;
  }
) {
  // Get existing transaction
  const existing = await db.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  
  if (!existing || existing.length === 0) {
    return null;
  }
  
  const transaction = existing[0];
  
  // Build update query
  const updateFields: string[] = [];
  const params: any[] = [];
  
  if (updates.amount !== undefined) {
    updateFields.push('amount = ?');
    params.push(updates.amount);
  }
  
  if (updates.category !== undefined) {
    updateFields.push('category = ?');
    params.push(updates.category);
  }
  
  if (updates.description !== undefined) {
    updateFields.push('description = ?');
    params.push(updates.description);
  }
  
  if (updates.date !== undefined) {
    updateFields.push('date = ?');
    params.push(updates.date);
  }
  
  if (updates.type !== undefined) {
    updateFields.push('type = ?');
    params.push(updates.type);
  }
  
  if (updateFields.length === 0) {
    return transaction;
  }
  
  updateFields.push('updated_at = datetime("now")');
  params.push(transactionId, userId);
  
  await db.query(`
    UPDATE transactions
    SET ${updateFields.join(', ')}
    WHERE id = ? AND user_id = ?
  `, params);
  
  // Recalculate balances if amount or type changed
  if (updates.amount !== undefined || updates.type !== undefined) {
    await recalculateBalances(userId, transaction.client_id, transaction.date);
  }
  
  // Get updated transaction
  const updated = await db.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  
  return updated[0];
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(userId: string, transactionId: string) {
  const transaction = await db.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  
  if (!transaction || transaction.length === 0) {
    return false;
  }
  
  const deleted = transaction[0];
  
  await db.query(
    'DELETE FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  
  // Recalculate balances after deletion
  await recalculateBalances(userId, deleted.client_id, deleted.date);
  
  return true;
}

/**
 * Bulk import transactions from CSV
 */
export async function bulkImportTransactions(
  userId: string,
  clientId: string | null,
  data: {
    transactions: any[];
    source: string;
  }
) {
  const imported: any[] = [];
  const failed: any[] = [];
  const errors: any[] = [];
  
  for (const txn of data.transactions) {
    try {
      // Validate required fields
      if (!txn.amount || !txn.date) {
        failed.push(txn);
        errors.push({ transaction: txn, error: 'Missing required fields: amount or date' });
        continue;
      }
      
      // Determine type
      let type = txn.type || (txn.amount > 0 ? 'income' : 'expense');
      const amount = Math.abs(txn.amount);
      
      // Create transaction
      const created = await createTransaction(userId, clientId, {
        type,
        amount,
        category: txn.category,
        description: txn.description || txn.memo || '',
        date: txn.date,
        metadata: {
          source: data.source,
          importedAt: new Date().toISOString(),
          originalData: txn
        }
      });
      
      imported.push(created);
    } catch (error) {
      failed.push(txn);
      errors.push({ 
        transaction: txn, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
  
  return {
    imported: imported.length,
    failed: failed.length,
    errors
  };
}

/**
 * Auto-categorize a transaction using AI/rules
 */
export async function categorizeTransaction(userId: string, transactionId: string) {
  const transaction = await db.query(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
    [transactionId, userId]
  );
  
  if (!transaction || transaction.length === 0) {
    throw new Error('Transaction not found');
  }
  
  const txn = transaction[0];
  const category = await autoCategorize(txn.description, txn.type);
  
  await db.query(
    'UPDATE transactions SET category = ?, updated_at = datetime("now") WHERE id = ?',
    [category, transactionId]
  );
  
  return category;
}

// Helper functions

/**
 * Get current balance for user/client
 */
async function getCurrentBalance(userId: string, clientId: string | null): Promise<number> {
  const result = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId, clientId, clientId]);
  
  return result[0]?.balance || 0;
}

/**
 * Auto-categorize transaction based on description
 */
async function autoCategorize(description: string, type: string): Promise<string> {
  const desc = description.toLowerCase();
  
  // Income categories
  if (type === 'income') {
    if (desc.includes('salary') || desc.includes('payroll')) return 'Salary';
    if (desc.includes('consulting') || desc.includes('freelance')) return 'Consulting Revenue';
    if (desc.includes('product') || desc.includes('sale')) return 'Product Sales';
    if (desc.includes('service')) return 'Service Revenue';
    if (desc.includes('interest')) return 'Interest Income';
    return 'Other Income';
  }
  
  // Expense categories
  if (desc.includes('rent') || desc.includes('lease')) return 'Rent & Utilities';
  if (desc.includes('salary') || desc.includes('payroll') || desc.includes('wage')) return 'Salaries & Wages';
  if (desc.includes('marketing') || desc.includes('advertising') || desc.includes('ads')) return 'Marketing';
  if (desc.includes('software') || desc.includes('subscription') || desc.includes('saas')) return 'Software & Tools';
  if (desc.includes('office') || desc.includes('supplies')) return 'Office Supplies';
  if (desc.includes('travel') || desc.includes('hotel') || desc.includes('flight')) return 'Travel';
  if (desc.includes('meal') || desc.includes('restaurant') || desc.includes('food')) return 'Meals & Entertainment';
  if (desc.includes('insurance')) return 'Insurance';
  if (desc.includes('legal') || desc.includes('accounting') || desc.includes('professional')) return 'Professional Services';
  if (desc.includes('tax')) return 'Taxes';
  if (desc.includes('internet') || desc.includes('phone') || desc.includes('mobile')) return 'Communications';
  
  return 'Other Expenses';
}

/**
 * Recalculate balances after transaction change
 */
async function recalculateBalances(
  userId: string,
  clientId: string | null,
  fromDate: string
) {
  // Get all transactions from date forward
  const transactions = await db.query(`
    SELECT * FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date >= ?
    ORDER BY date ASC, created_at ASC
  `, [userId, clientId, clientId, fromDate]);
  
  // Get starting balance
  let balance = await getBalanceBeforeDate(userId, clientId, fromDate);
  
  // Update each transaction's balance
  for (const txn of transactions) {
    const change = txn.type === 'income' ? txn.amount : -txn.amount;
    balance += change;
    
    await db.query(
      'UPDATE transactions SET balance = ? WHERE id = ?',
      [balance, txn.id]
    );
  }
}

/**
 * Get balance before a specific date
 */
async function getBalanceBeforeDate(
  userId: string,
  clientId: string | null,
  date: string
): Promise<number> {
  const result = await db.query(`
    SELECT balance FROM transactions
    WHERE user_id = ?
      AND (client_id = ? OR ? IS NULL)
      AND date < ?
    ORDER BY date DESC, created_at DESC
    LIMIT 1
  `, [userId, clientId, clientId, date]);
  
  return result[0]?.balance || 0;
}

/**
 * Check for alerts based on transaction
 */
async function checkTransactionAlerts(
  userId: string,
  clientId: string | null,
  newBalance: number,
  amount: number,
  type: string
) {
  // Low balance alert
  if (newBalance < 1000 && newBalance > 0) {
    await createAlert(userId, clientId, {
      type: 'cash_flow_warning',
      severity: 'warning',
      title: 'Low Cash Balance',
      message: `Your cash balance is low: $${newBalance.toFixed(2)}`
    });
  }
  
  // Negative balance alert
  if (newBalance < 0) {
    await createAlert(userId, clientId, {
      type: 'cash_flow_warning',
      severity: 'critical',
      title: 'Negative Cash Balance',
      message: `Your account is overdrawn: $${newBalance.toFixed(2)}`
    });
  }
  
  // Large expense alert
  if (type === 'expense' && amount > 5000) {
    await createAlert(userId, clientId, {
      type: 'expense_spike',
      severity: 'info',
      title: 'Large Expense Detected',
      message: `Large expense recorded: $${amount.toFixed(2)}`
    });
  }
}

/**
 * Create an alert
 */
async function createAlert(
  userId: string,
  clientId: string | null,
  data: {
    type: string;
    severity: string;
    title: string;
    message: string;
  }
) {
  const alertId = crypto.randomUUID();
  
  await db.query(`
    INSERT INTO alerts (
      id, user_id, client_id, type, severity,
      title, message, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'))
  `, [
    alertId,
    userId,
    clientId,
    data.type,
    data.severity,
    data.title,
    data.message
  ]);
}
