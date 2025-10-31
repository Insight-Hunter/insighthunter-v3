// backend/src/routes/analytics.ts
// Analytics API Routes

import { Router } from 'express';
import { 
  getTrends,
  getCustomerAnalysis,
  getExpenseBreakdown,
  getRevenueAnalysis,
  getBenchmarks,
  detectAnomalies
} from '../services/analyticsServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * GET /api/analytics/trends
 * Get financial trends over time
 */
router.get('/trends', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { metric, period = '90d' } = req.query;
    
    const trends = await getTrends(userId, clientId, {
      metric: metric as string,
      period: period as string
    });
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Trends fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trends'
    });
  }
});

/**
 * GET /api/analytics/customers
 * Get customer/client revenue analysis
 */
router.get('/customers', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '90d' } = req.query;
    
    const analysis = await getCustomerAnalysis(userId, clientId, {
      period: period as string
    });
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Customer analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze customers'
    });
  }
});

/**
 * GET /api/analytics/expenses
 * Get expense breakdown by category
 */
router.get('/expenses', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '90d', groupBy = 'category' } = req.query;
    
    const breakdown = await getExpenseBreakdown(userId, clientId, {
      period: period as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('Expense breakdown error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to breakdown expenses'
    });
  }
});

/**
 * GET /api/analytics/revenue
 * Get revenue analysis by source/product
 */
router.get('/revenue', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '90d', groupBy = 'source' } = req.query;
    
    const analysis = await getRevenueAnalysis(userId, clientId, {
      period: period as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Revenue analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze revenue'
    });
  }
});

/**
 * GET /api/analytics/benchmarks
 * Get industry benchmarks comparison
 */
router.get('/benchmarks', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { industry } = req.query;
    
    const benchmarks = await getBenchmarks(userId, clientId, {
      industry: industry as string
    });
    
    res.json({
      success: true,
      data: benchmarks
    });
  } catch (error) {
    console.error('Benchmarks fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch benchmarks'
    });
  }
});

/**
 * GET /api/analytics/anomalies
 * Detect unusual patterns and anomalies
 */
router.get('/anomalies', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '30d', sensitivity = 'medium' } = req.query;
    
    const anomalies = await detectAnomalies(userId, clientId, {
      period: period as string,
      sensitivity: sensitivity as string
    });
    
    res.json({
      success: true,
      data: anomalies
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect anomalies'
    });
  }
});

/**
 * GET /api/analytics/growth
 * Get growth metrics and rates
 */
router.get('/growth', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '12m' } = req.query;
    
    const growth = await db.query(`
      WITH monthly_revenue AS (
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(amount) as revenue
        FROM transactions
        WHERE user_id = ? 
          AND type = 'income'
          AND date >= date('now', '-' || ? || ' months')
        GROUP BY strftime('%Y-%m', date)
      )
      SELECT 
        month,
        revenue,
        LAG(revenue) OVER (ORDER BY month) as prev_revenue,
        ROUND(((revenue - LAG(revenue) OVER (ORDER BY month)) / 
               LAG(revenue) OVER (ORDER BY month)) * 100, 2) as growth_rate
      FROM monthly_revenue
      ORDER BY month DESC
    `, [userId, parseInt(period as string)]);
    
    res.json({
      success: true,
      data: growth
    });
  } catch (error) {
    console.error('Growth calculation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate growth'
    });
  }
});

export default router;
