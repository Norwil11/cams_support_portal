import express from 'express';
import {
    getIncharges,
    submitLog,
    getStaffAccessLogs,
    getCamsAdjustmentLogs,
    getCamsReopenLogs,
    getDailyCamsLogs,
    updateLog,
    getAllInchargesAdmin,
    getAllDivisions,
    createIncharge,
    updateIncharge,
    deleteIncharge
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

// ── Admin: Incharge Registry ──────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only endpoints for managing the Division Incharge Registry
 */

/**
 * @swagger
 * /api/admin/incharges:
 *   get:
 *     summary: Get all incharges (admin view with Division & Operation joins)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Full list of incharges with division and operation info
 *       500:
 *         description: Server error
 */
router.get('/admin/incharges', getAllInchargesAdmin);

/**
 * @swagger
 * /api/admin/incharges:
 *   post:
 *     summary: Create a new incharge record
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Dela Cruz
 *               role:
 *                 type: string
 *                 example: Cluster Lead
 *               division_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 3
 *     responses:
 *       201:
 *         description: Incharge created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/admin/incharges', createIncharge);

/**
 * @swagger
 * /api/admin/incharges/{id}:
 *   put:
 *     summary: Update an existing incharge record
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the incharge to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *               division_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Incharge updated successfully
 *       404:
 *         description: Incharge not found
 *       500:
 *         description: Server error
 */
router.put('/admin/incharges/:id', updateIncharge);

/**
 * @swagger
 * /api/admin/incharges/{id}:
 *   delete:
 *     summary: Delete an incharge record
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the incharge to delete
 *     responses:
 *       200:
 *         description: Incharge deleted successfully
 *       404:
 *         description: Incharge not found
 *       500:
 *         description: Server error
 */
router.delete('/admin/incharges/:id', deleteIncharge);

/**
 * @swagger
 * /api/admin/divisions:
 *   get:
 *     summary: Get all divisions (for dropdowns)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all divisions
 *       500:
 *         description: Server error
 */
router.get('/admin/divisions', getAllDivisions);

export default router;
