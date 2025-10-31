// backend/src/routes/forecast.ts
// Forecast API Routes

import { Router } from 'express';
import { 
  generateForecast, 
  getScenarios, 
  updateAssumptions,
  getForecastMetrics,
  compareForecast 
} from '../services/forecastServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * POST /api/forecast/generate
 * Generate new forecast based on historical data
 */
router.post('/generate', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { type, period, assumptions } = req.body;
    
    const forecast = await generateForecast(userId, clientId, {
      type: type || 'cash_flow',
      period: period || 60,
      assumptions: assumptions || {}
    });
    
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Forecast generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate forecast'
    });
  }
});

/**
 * GET /api/forecast/scenarios
 * Get forecast scenarios (best, base, worst)
 */
router.get('/scenarios', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period = 60, type = 'cash_flow' } = req.query;
    
    const scenarios = await getScenarios(userId, clientId, {
      period: parseInt(period as string),
      type: type as string
    });
    
    res.json({
      success: true,
      data: scenarios
    });
  } catch (error) {
    console.error('Scenarios fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scenarios'
    });
  }
});

/**
 * PUT /api/forecast/assumptions
 * Update forecast assumptions
 */
router.put('/assumptions', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { assumptions } = req.body;
    
    if (!assumptions) {
      return res.status(400).json({
        success: false,
        error: 'Assumptions required'
      });
    }
    
    const updatedForecast = await updateAssumptions(userId, clientId, assumptions);
    
    res.json({
      success: true,
      data: updatedForecast
    });
  } catch (error) {
    console.error('Assumptions update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assumptions'
    });
  }
});

/**
 * GET /api/forecast/metrics
 * Get forecast metrics (burn rate, runway, break-even)
 */
router.get('/metrics', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    
    const metrics = await getForecastMetrics(userId, clientId);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Metrics fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast metrics'
    });
  }
});

/**
 * POST /api/forecast/compare
 * Compare multiple forecast scenarios
 */
router.post('/compare', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { scenarios } = req.body;
    
    const comparison = await compareForecast(userId, clientId, scenarios);
    
    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Forecast comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to compare forecasts'
    });
  }
});

/**
 * GET /api/forecast/:id
 * Get specific forecast by ID
 */
router.get('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const forecast = await db.query(`
      SELECT * FROM forecasts
      WHERE id = ? AND user_id = ?
    `, [id, userId]);
    
    if (!forecast || forecast.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Forecast not found'
      });
    }
    
    res.json({
      success: true,
      data: forecast[0]
    });
  } catch (error) {
    console.error('Forecast fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch forecast'
    });
  }
});

export default router;
