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
        const [r] = await s.query(`DESCRIBE branches`);
        fs.writeFileSync('branches_cols.txt', r.map(c => c.Field).join(', '));
    } catch (e) {
        fs.writeFileSync('branches_cols.txt', "Error: " + e.message);
    }
    await s.close();
}

run();
