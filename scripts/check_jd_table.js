import 'dotenv/config';
import { Sequelize } from 'sequelize';

const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

async function run() {
    try {
        const [tables] = await s.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        console.log("Full Table List:", tableNames.join(', '));

        const jdTable = tableNames.find(t => t.toLowerCase().includes('jd'));
        if (jdTable) {
            console.log(`\n--- DESCRIBE ${jdTable} ---`);
            const [cols] = await s.query(`DESCRIBE ${jdTable}`);
            cols.forEach(c => console.log(`${c.Field}: ${c.Type}`));

            console.log(`\n--- DATA ${jdTable} ---`);
            const [data] = await s.query(`SELECT * FROM ${jdTable} LIMIT 5`);
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log("\nNo table with 'jd' in name found.");
        }

        console.log("\n--- DESCRIBE operations ---");
        const [opsCols] = await s.query('DESCRIBE operations');
        opsCols.forEach(c => console.log(`${c.Field}: ${c.Type}`));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await s.close();
    }
}

run();
