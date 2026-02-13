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
        const [ops] = await s.query('SELECT * FROM operations');
        console.log("--- OPERATIONS ---");
        ops.forEach(o => {
            console.log(`ID: ${o.id}, Name: ${o.name || o.operation}, InCharge: ${o.in_charge}`);
        });

        const [divs] = await s.query('SELECT * FROM divisions');
        console.log("\n--- DIVISIONS ---");
        divs.forEach(d => {
            if (d.in_charge) {
                console.log(`ID: ${d.id}, Division: ${d.division}, InCharge: ${d.in_charge}, OpID: ${d.operation_id}`);
            }
        });

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await s.close();
    }
}

run();
