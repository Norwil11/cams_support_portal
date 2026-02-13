import express from 'express';
import { getMonthlyReport, getDailyReport } from '../controllers/reportController.js';
import validate from '../middleware/validation.js';
import { monthlyReportSchema, dailyReportSchema } from '../utils/schemas.js';

const router = express.Router();

/**
 * @swagger
 * /api/monthly-report:
 *   get:
 *     summary: Get monthly save report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Monthly report data
 */
router.get('/monthly-report', validate(monthlyReportSchema), getMonthlyReport);

/**
 * @swagger
 * /api/daily-report:
 *   get:
 *     summary: Get daily save report
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *       - in: query
 *         name: operation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily report data
 */
router.get('/daily-report', validate(dailyReportSchema), getDailyReport);

export default router;
