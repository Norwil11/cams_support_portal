import express from 'express';
import { getClientTracker } from '../controllers/clientController.js';
import validate from '../middleware/validation.js';
import { clientTrackerSchema } from '../utils/schemas.js';

const router = express.Router();

/**
 * @swagger
 * /api/client-tracker:
 *   get:
 *     summary: Search client data by reference number
 *     tags: [Clients]
 *     parameters:
 *       - in: query
 *         name: refNo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client record and related data
 */
router.get('/client-tracker', validate(clientTrackerSchema), getClientTracker);

export default router;
