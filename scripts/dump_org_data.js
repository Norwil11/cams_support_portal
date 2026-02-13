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
    const operations = await s.query('SELECT * FROM operations');
    const divisions = await s.query('SELECT * FROM divisions');
    const incharges = await s.query('SELECT * FROM responsible_incharge');

    fs.writeFileSync('org_dump.json', JSON.stringify({
        operations: operations[0],
        divisions: divisions[0],
        incharges: incharges[0]
    }, null, 2));

    await s.close();
}

run();
