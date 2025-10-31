// backend/src/routes/reports.ts
// Financial Reports API Routes

import { Router } from 'express';
import { 
  generateProfitLoss,
  generateBalanceSheet,
  generateCashFlowStatement,
  generateKPIDashboard,
  exportReport,
  getReportHistory
} from '../services/reportServices';
import { validateAuth } from '../middlewares/validation';

const router = Router();

/**
 * POST /api/reports/profit-loss
 * Generate Profit & Loss statement
 */
router.post('/profit-loss', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { startDate, endDate, period } = req.body;
    
    const report = await generateProfitLoss(userId, clientId, {
      startDate,
      endDate,
      period: period || 'monthly'
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('P&L generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Profit & Loss statement'
    });
  }
});

/**
 * POST /api/reports/balance-sheet
 * Generate Balance Sheet
 */
router.post('/balance-sheet', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { asOfDate } = req.body;
    
    const report = await generateBalanceSheet(userId, clientId, {
      asOfDate: asOfDate || new Date().toISOString().split('T')[0]
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Balance Sheet generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Balance Sheet'
    });
  }
});

/**
 * POST /api/reports/cash-flow-statement
 * Generate Cash Flow Statement
 */
router.post('/cash-flow-statement', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { startDate, endDate, period } = req.body;
    
    const report = await generateCashFlowStatement(userId, clientId, {
      startDate,
      endDate,
      period: period || 'monthly'
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Cash Flow Statement generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate Cash Flow Statement'
    });
  }
});

/**
 * POST /api/reports/kpi-dashboard
 * Generate KPI Dashboard report
 */
router.post('/kpi-dashboard', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { period } = req.body;
    
    const report = await generateKPIDashboard(userId, clientId, {
      period: period || '30d'
    });
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('KPI Dashboard generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate KPI Dashboard'
    });
  }
});

/**
 * POST /api/reports/export
 * Export report to PDF, Excel, or CSV
 */
router.post('/export', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { reportId, format } = req.body;
    
    if (!reportId || !format) {
      return res.status(400).json({
        success: false,
        error: 'Report ID and format required'
      });
    }
    
    const exportedFile = await exportReport(userId, clientId, reportId, format);
    
    res.json({
      success: true,
      data: {
        url: exportedFile.url,
        filename: exportedFile.filename,
        format: format
      }
    });
  } catch (error) {
    console.error('Report export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    });
  }
});

/**
 * GET /api/reports/history
 * Get report generation history
 */
router.get('/history', validateAuth, async (req, res) => {
  try {
    const { userId, clientId } = req.user;
    const { type, limit = 20 } = req.query;
    
    const history = await getReportHistory(userId, clientId, {
      type: type as string,
      limit: parseInt(limit as string)
    });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Report history fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report history'
    });
  }
});

/**
 * GET /api/reports/:id
 * Get specific report by ID
 */
router.get('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    const report = await db.query(`
      SELECT * FROM reports
      WHERE id = ? AND user_id = ?
    `, [id, userId]);
    
    if (!report || report.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report[0]
    });
  } catch (error) {
    console.error('Report fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report
 */
router.delete('/:id', validateAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    
    await db.query(`
      DELETE FROM reports
      WHERE id = ? AND user_id = ?
    `, [id, userId]);
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Report deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete report'
    });
  }
});

export default router;
