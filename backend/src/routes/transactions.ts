// backend/src/routes/transactions.ts
// Transactions API Routes

import { Router } from 'express';
import { 
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactions,
  bulkImportTransactions,
  categorizeTransaction
} from '../services/transactionServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * GET /api/transactions
 * Get transactions with filters and pagination
 */
router.get('/', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { 
      page = 1, 
      limit = 50, 
      type, 
      category, 
      startDate, 
      endDate,
      search 
    } = req.query;
    
    const transactions = await getTransactions(userId, clientId, {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      type: type as string,
      category: category as string,
      startDate: startDate as string,
      endDate: endDate as string,
      search: search as string
    });
    
    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions'
    });
  }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const transactionData = req.body;
    
    if (!transactionData.amount || !transactionData.type || !transactionData.date) {
      return res.status(400).json({
        success: false,
        error: 'Amount, type, and date are required'
      });
    }
    
    const transaction = await createTransaction(userId, clientId, transactionData);
    
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
router.put('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const updates = req.body;
    
    const transaction = await updateTransaction(userId, id, updates);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const result = await deleteTransaction(userId, id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Transaction deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete transaction'
    });
  }
});

/**
 * POST /api/transactions/bulk-import
 * Import multiple transactions from CSV
 */
router.post('/bulk-import', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { transactions, source } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Transactions array required'
      });
    }
    
    const result = await bulkImportTransactions(userId, clientId, {
      transactions,
      source: source || 'manual'
    });
    
    res.json({
      success: true,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors
      }
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import transactions'
    });
  }
});

/**
 * POST /api/transactions/:id/categorize
 * Auto-categorize a transaction using AI
 */
router.post('/:id/categorize', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const category = await categorizeTransaction(userId, id);
    
    res.json({
      success: true,
      data: {
        transactionId: id,
        category: category
      }
    });
  } catch (error) {
    console.error('Categorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to categorize transaction'
    });
  }
});

/**
 * GET /api/transactions/summary
 * Get transaction summary statistics
 */
router.get('/summary', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '30d' } = req.query;
    
    const days = parseInt(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const summary = await db.query(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        AVG(amount) as avg_transaction,
        MAX(amount) as max_transaction,
        MIN(amount) as min_transaction
      FROM transactions
      WHERE user_id = ?
        AND date >= ?
    `, [userId, startDate.toISOString()]);
    
    res.json({
      success: true,
      data: summary[0]
    });
  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary'
    });
  }
});

/**
 * GET /api/transactions/:id
 * Get single transaction by ID
 */
router.get('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const transaction = await db.query(`
      SELECT * FROM transactions
      WHERE id = ? AND user_id = ?
    `, [id, userId]);
    
    if (!transaction || transaction.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    res.json({
      success: true,
      data: transaction[0]
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction'
    });
  }
});

export default router;
