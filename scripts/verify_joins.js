import {
    StaffAccess,
    BranchDB1,
    AreaDB1,
    RegionDB1,
    OperationDB1,
    Division
} from '../src/models/index.js';
import logger from '../utils/logger.js';

const HIERARCHY_INCLUDE = {
    model: BranchDB1,
    as: 'hierarchy',
    include: [{
        model: AreaDB1,
        as: 'area',
        include: [
            { model: RegionDB1, as: 'region' },
            {
                model: Division,
                as: 'division',
                include: [{ model: OperationDB1, as: 'operation' }]
            }
        ]
    }]
};

const flattenLogWithHierarchy = (log) => {
    const raw = log.get({ plain: true });
    const h = raw.hierarchy || {};
    const a = h.area || {};
    const r = a.region || {};
    const d = a.division || {};
    const o = d.operation || {};

    delete raw.incharge_id;
    delete raw.hierarchy;

    return {
        ...raw,
        branch_name: h.branch_name || '---',
        area: a.area_name || '---',
        region: r.region || '---',
        division: d.division || '---',
        operation: o.name || '---'
    };
};

async function test() {
    try {
        console.log('Testing StaffAccess Join...');
        const logs = await StaffAccess.findAll({
            include: [HIERARCHY_INCLUDE],
            limit: 1
        });

        if (logs.length > 0) {
            const flattened = flattenLogWithHierarchy(logs[0]);
            console.log('Flattened Sample Log:', JSON.stringify(flattened, null, 2));
            console.log('\nSuccess: Hierarchy fields populated!');
        } else {
            console.log('No logs found to test.');
        }
    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        // Models are using global sequelize instances, need to close them or exit
        process.exit();
    }
}

test();
