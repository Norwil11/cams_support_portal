import express from 'express';
import {
    getIncharges,
    submitLog,
    getStaffAccessLogs,
    getCamsAdjustmentLogs,
    getCamsReopenLogs,
    getDailyCamsLogs,
    updateLog
} from '../controllers/supportController.js';

const router = express.Router();

/**
 * @swagger
 * /api/incharges:
 *   get:
 *     summary: Get all responsible incharges
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: List of incharges
 */
router.get('/incharges', getIncharges);

/**
 * @swagger
 * /api/support-logs:
 *   post:
 *     summary: Submit a new support log
 *     tags: [Support]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inchargeId:
 *                 type: integer
 *               logData:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log submitted successfully
 */
router.post('/support-logs', submitLog);

// Retrieval routes for consolidated logs

/**
 * @swagger
 * /api/support-logs/staff-access:
 *   get:
 *     summary: Retrieve all Staff Access logs
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: List of staff access logs
 */
router.get('/support-logs/staff-access', getStaffAccessLogs);

/**
 * @swagger
 * /api/support-logs/cams-adjustment:
 *   get:
 *     summary: Retrieve all CAMS Adjustment logs
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: List of CAMS adjustment logs
 */
router.get('/support-logs/cams-adjustment', getCamsAdjustmentLogs);

/**
 * @swagger
 * /api/support-logs/cams-reopen:
 *   get:
 *     summary: Retrieve all CAMS Re-open logs
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: List of CAMS re-open logs
 */
router.get('/support-logs/cams-reopen', getCamsReopenLogs);

/**
 * @swagger
 * /api/support-logs/daily-concerns:
 *   get:
 *     summary: Retrieve all Daily CAMS Concerns
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: List of daily cams concern logs
 */
router.get('/support-logs/daily-concerns', getDailyCamsLogs);

// Update route for real-time edits
router.put('/support-logs/:type/:id', updateLog);

export default router;
