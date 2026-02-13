import 'dotenv/config';
import { Sequelize } from 'sequelize';
import fs from 'fs';

const s = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
});

async function run() {
    try {
        const [jdCols] = await s.query('DESCRIBE jd_incharge');
        const [jdData] = await s.query('SELECT * FROM jd_incharge');
        const [opsCols] = await s.query('DESCRIBE operations');

        const output = {
            jd_incharge_schema: jdCols,
            jd_incharge_data: jdData,
            operations_schema: opsCols
        };

        fs.writeFileSync('jd_schema_check.json', JSON.stringify(output, null, 2));
        console.log("Schema check written to jd_schema_check.json");

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await s.close();
    }
}

run();
