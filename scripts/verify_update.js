import axios from 'axios';

const verifyUpdate = async () => {
    try {
        console.log('Fetching initial log...');
        const res = await axios.get('http://localhost:5000/api/support-logs/staff-access');
        const firstLog = res.data[0];

        if (!firstLog) {
            console.log('No logs found to test.');
            process.exit(0);
        }

        console.log(`Initial Reason: "${firstLog.reason}"`);
        console.log(`Initial UpdatedAt: ${firstLog.updated_at}`);

        const newReason = `Test Reason ${Date.now()}`;
        console.log(`Updating to: "${newReason}"...`);

        await axios.put(`http://localhost:5000/api/support-logs/staff-access/${firstLog.id}`, {
            reason: newReason
        });

        console.log('Fetching updated log...');
        const res2 = await axios.get('http://localhost:5000/api/support-logs/staff-access');
        const updatedLog = res2.data.find(l => l.id === firstLog.id);

        console.log(`New Reason: "${updatedLog.reason}"`);
        console.log(`New UpdatedAt: ${updatedLog.updated_at}`);

        if (updatedLog.reason === newReason && updatedLog.updated_at !== firstLog.updated_at) {
            console.log('✅ Success: Real-time update and timestamp working!');
        } else {
            console.log('❌ Failure: Reason or timestamp did not update as expected.');
        }

    } catch (error) {
        console.error('Error during verification:', error.message);
    }
};

verifyUpdate();
