import asyncHandler from 'express-async-handler';
import { Client } from '../src/models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

export const searchContact = asyncHandler(async (req, res) => {
    const { number } = req.query;

    logger.info(`Searching contacts for number: ${number}`);

    const rows = await Client.findAll({
        where: {
            [Op.or]: [
                { mobileNo: number },
                { contactNo: number },
                { landlineNo: number }
            ]
        },
        limit: 100
    });

    res.json(rows);
});
