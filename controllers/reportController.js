import asyncHandler from 'express-async-handler';
import { Division, ResponsibleIncharge, Branch, Area, Region, DivisionDB2, MonthlySavedReport, DailySavedReport, Operation } from '../src/models/index.js';
import logger from '../utils/logger.js';

export const getMonthlyReport = asyncHandler(async (req, res) => {
    const { month, year, operation } = req.query;

    logger.info(`Fetching monthly report for ${operation} - ${month}/${year}`);

    // 1. Get Incharge Mapping from DB1
    const inchargeRows = await Division.findAll({
        include: [{ model: ResponsibleIncharge }]
    });

    const inchargeMap = {};
    inchargeRows.forEach(row => {
        if (row.division) {
            const divName = row.division.trim().toLowerCase();
            const incharge = row.ResponsibleIncharge
                ? `${row.ResponsibleIncharge.firstName} ${row.ResponsibleIncharge.lastName}`
                : 'Unassigned';
            inchargeMap[divName] = incharge;
        }
    });

    // 2. Get Report Data from DB2
    const branches = await Branch.findAll({
        include: [
            {
                model: Area,
                required: true,
                include: [{
                    model: Region,
                    required: true,
                    include: [{
                        model: DivisionDB2,
                        required: true,
                        include: [{
                            model: Operation,
                            required: true,
                            where: { name: operation }
                        }]
                    }]
                }]
            },
            {
                model: MonthlySavedReport,
                required: false,
                where: { month, year }
            }
        ],
        order: [
            ['BranchNo', 'ASC'],
            [{ model: Area }, { model: Region }, { model: DivisionDB2 }, 'division', 'ASC']
        ]
    });

    // 3. Map results and join incharge data
    const formattedRows = branches.map(branch => {
        const division = branch.Area.Region.DivisionDB2;
        const divKey = (division.division || '').trim().toLowerCase();

        return {
            branchCode: branch.BranchNo,
            branchName: branch.Branch,
            area: branch.Area.area_name,
            region: branch.Area.Region.region,
            division: division.division,
            operation: operation,
            handledBy: inchargeMap[divKey] || 'Unassigned',
            status: branch.MonthlySavedReports && branch.MonthlySavedReports.length > 0
                ? 'Saved Report'
                : 'No Saved Report',
            savedCount: (() => {
                if (!branch.MonthlySavedReports || branch.MonthlySavedReports.length === 0) return 0;
                const counts = {};
                let max = 0;
                branch.MonthlySavedReports.forEach(r => {
                    counts[r.code] = (counts[r.code] || 0) + 1;
                    if (counts[r.code] > max) max = counts[r.code];
                });
                return max;
            })()
        };
    });

    res.json(formattedRows);
});

export const getDailyReport = asyncHandler(async (req, res) => {
    const { date, operation } = req.query;

    logger.info(`Fetching daily report for ${operation} - ${date}`);

    // 1. Get Incharge Mapping from DB1
    const inchargeRows = await Division.findAll({
        include: [{ model: ResponsibleIncharge }]
    });

    const inchargeMap = {};
    inchargeRows.forEach(row => {
        if (row.division) {
            const divName = row.division.trim().toLowerCase();
            const incharge = row.ResponsibleIncharge
                ? `${row.ResponsibleIncharge.firstName} ${row.ResponsibleIncharge.lastName}`
                : 'Unassigned';
            inchargeMap[divName] = incharge;
        }
    });

    // 2. Get Report Data from DB2
    const branches = await Branch.findAll({
        include: [
            {
                model: Area,
                required: true,
                include: [{
                    model: Region,
                    required: true,
                    include: [{
                        model: DivisionDB2,
                        required: true,
                        include: [{
                            model: Operation,
                            required: true,
                            where: { name: operation }
                        }]
                    }]
                }]
            },
            {
                model: DailySavedReport,
                required: false,
                where: { transaction_date: date }
            }
        ],
        order: [
            ['BranchNo', 'ASC'],
            [{ model: Area }, { model: Region }, { model: DivisionDB2 }, 'division', 'ASC']
        ]
    });

    // 3. Map results and join incharge data
    const formattedRows = branches.map(branch => {
        const division = branch.Area.Region.DivisionDB2;
        const divKey = (division.division || '').trim().toLowerCase();

        return {
            branchCode: branch.BranchNo,
            branchName: branch.Branch,
            area: branch.Area.area_name,
            region: branch.Area.Region.region,
            division: division.division,
            operation: operation,
            handledBy: inchargeMap[divKey] || 'Unassigned',
            status: branch.DailySavedReports && branch.DailySavedReports.length > 0
                ? 'Saved Report'
                : 'No Saved Report',
            savedCount: (() => {
                if (!branch.DailySavedReports || branch.DailySavedReports.length === 0) return 0;
                const counts = {};
                let max = 0;
                branch.DailySavedReports.forEach(r => {
                    counts[r.code] = (counts[r.code] || 0) + 1;
                    if (counts[r.code] > max) max = counts[r.code];
                });
                return max;
            })()
        };
    });

    res.json(formattedRows);
});
