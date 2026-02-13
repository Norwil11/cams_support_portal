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
    const tables = ['areas', 'regions', 'divisions', 'operations', 'responsible_incharge', 'branches'];
    const results = [];
    for (const t of tables) {
        try {
            const [r] = await s.query(`DESCRIBE ${t}`);
            results.push(`${t}: ${r.map(c => c.Field).join(', ')}`);
        } catch (e) {
            results.push(`${t}: Error - ${e.message}`);
        }
    }
    fs.writeFileSync('db1_schema_dump.txt', results.join('\n'));
    await s.close();
}

run();
