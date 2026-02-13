import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

async function inspect() {
    try {
        const [results] = await sequelize.query("DESCRIBE staff_access");
        console.log("Columns for staff_access:");
        console.table(results);

        const [results2] = await sequelize.query("DESCRIBE cams_reopen");
        console.log("Columns for cams_reopen:");
        console.table(results2);
    } catch (err) {
        console.error("Inspection failed:", err.message);
    } finally {
        await sequelize.close();
    }
}

inspect();
