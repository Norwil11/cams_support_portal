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
        const [r] = await s.query('DESCRIBE cams_reopen');
        console.log("Columns:", r.map(c => c.Field).join(', '));
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await s.close();
    }
}

run();
