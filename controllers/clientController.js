import asyncHandler from 'express-async-handler';
import { Client, ClientSavings, UnclaimedAccount, BadDebt } from '../src/models/index.js';
import logger from '../utils/logger.js';

export const getClientTracker = asyncHandler(async (req, res) => {
    const { refNo } = req.query;

    logger.info(`Fetching client data for refNo: ${refNo}`);

    const clientData = await Client.findOne({
        where: { clientRefNo: refNo },
        include: [
            { model: ClientSavings, as: 'ClientSavings' },
            { model: UnclaimedAccount, as: 'UnclaimedAccount' },
            { model: BadDebt, as: 'BadDebt' }
        ]
    });

    if (!clientData) {
        logger.warn(`Client not found: ${refNo}`);
        return res.status(404).json({ error: "Client not found" });
    }

    res.json({
        client_info: {
            "Branch": clientData.branchNo,
            "Name": `${clientData.firstName} ${clientData.middleName} ${clientData.lastName}`,
            "Birthdate": clientData.birthdate,
            "Status": clientData.status,
            "CloseStatus": clientData.close_status,
            "MembershipDate": clientData.membershipDate,
            "ClosedOn": clientData.closedOn,

        },
        savings: clientData.ClientSavings ? [clientData.ClientSavings] : [],
        unclaimed: clientData.UnclaimedAccount ? [clientData.UnclaimedAccount] : [],
        bad_debt: clientData.BadDebt ? [clientData.BadDebt] : []
    });
});
