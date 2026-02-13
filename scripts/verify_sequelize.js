import StaffAccess from '../src/models/db1/StaffAccess.js';

const verifySequelize = async () => {
    try {
        console.log('Fetching first log via Sequelize...');
        const log = await StaffAccess.findOne();

        if (!log) {
            console.log('No logs found.');
            process.exit(0);
        }

        console.log(`Original UpdatedAt: ${log.updated_at}`);

        const newReason = `Sequelize Test ${Date.now()}`;
        console.log(`Updating reason to: ${newReason}...`);

        await log.update({ reason: newReason });

        // Fetch again to be sure
        const updatedLog = await StaffAccess.findByPk(log.id);
        console.log(`New UpdatedAt: ${updatedLog.updated_at}`);

        if (updatedLog.updated_at.getTime() > log.updated_at.getTime()) {
            console.log('✅ PASS: Database-level updated_at is working correctly!');
        } else {
            console.log('❌ FAIL: updated_at did not change.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Sequelize Error:', error.message);
        process.exit(1);
    }
};

verifySequelize();
