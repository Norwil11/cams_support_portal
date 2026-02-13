import 'dotenv/config';
import { Sequelize } from 'sequelize';

const s1 = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

const s2 = new Sequelize(process.env.DB2_NAME, process.env.DB2_USER, process.env.DB2_PASSWORD, {
    host: process.env.DB2_HOST,
    port: process.env.DB2_PORT,
    dialect: 'mysql',
    logging: false
});

async function run() {
    console.log('--- DB1 TABLES (csp) ---');
    try {
        const [tables1] = await s1.query("SHOW TABLES");
        console.log(tables1.map(t => Object.values(t)[0]));

        const [cols] = await s1.query("DESCRIBE staff_access");
        console.log('StaffAccess Columns:', cols.map(c => c.Field).join(', '));

        const [sample] = await s1.query("SELECT branch_code FROM staff_access LIMIT 1");
        console.log('Sample branch_code from StaffAccess:', sample);
    } catch (e) {
        console.error('DB1 Error:', e.message);
    }

    console.log('\n--- DB2 TABLES (cbsdb) ---');
    try {
        const [tables2] = await s2.query("SHOW TABLES");
        console.log(tables2.map(t => Object.values(t)[0]));

        const [bcols] = await s2.query("DESCRIBE branches");
        console.log('Branches Columns:', bcols.map(c => c.Field).join(', '));

        const [bsample] = await s2.query("SELECT BranchNo, Branch FROM branches LIMIT 1");
        console.log('Sample Branch from DB2:', bsample);
    } catch (e) {
        console.error('DB2 Error:', e.message);
    }

    await s1.close();
    await s2.close();
}

run();
