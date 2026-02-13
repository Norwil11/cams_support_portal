import express from 'express';
import { searchContact } from '../controllers/contactController.js';
import validate from '../middleware/validation.js';
import { contactSearchSchema } from '../utils/schemas.js';

const router = express.Router();

/**
 * @swagger
 * /api/contact-search:
 *   get:
 *     summary: Search contacts by number
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact search results
 */
router.get('/contact-search', validate(contactSearchSchema), searchContact);

export default router;
