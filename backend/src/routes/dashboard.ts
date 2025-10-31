// backend/src/routes/dashboard.ts
// Dashboard API Routes

import { Router } from 'express';
import { getDashboardOverview, getKPIs, getAlerts, getCashFlow } from '../services/dashboardServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * GET /api/dashboard/overview
 * Get dashboard overview with key metrics
 */
router.get('/overview', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '30d' } = req.query;
    
    const data = await getDashboardOverview(userId, clientId, period as string);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard overview'
    });
  }
});

/**
 * GET /api/dashboard/kpis
 * Get key performance indicators
 */
router.get('/kpis', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = '30d' } = req.query;
    
    const kpis = await getKPIs(userId, clientId, period as string);
    
    res.json({
      success: true,
      data: kpis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KPIs'
    });
  }
});

/**
 * GET /api/dashboard/alerts
 * Get active alerts and insights
 */
router.get('/alerts', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    
    const alerts = await getAlerts(userId, clientId);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts'
    });
  }
});

/**
 * GET /api/dashboard/cash-flow
 * Get cash flow trend data
 */
router.get('/cash-flow', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { days = 90 } = req.query;
    
    const cashFlow = await getCashFlow(userId, clientId, parseInt(days as string));
    
    res.json({
      success: true,
      data: cashFlow
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cash flow data'
    });
  }
});

export default router;
