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
    const tables = ['branches', 'areas', 'regions', 'divisions', 'operations'];
    let output = '';
    for (const t of tables) {
        try {
            const [r] = await s.query('DESCRIBE ' + t);
            output += `--- ${t} ---\n`;
            output += r.map(c => `${c.Field} (${c.Type})`).join(', ') + '\n';
            const [smp] = await s.query('SELECT * FROM ' + t + ' LIMIT 1');
            output += `Sample: ${JSON.stringify(smp[0])}\n\n`;
        } catch (e) {
            output += `${t}: Error - ${e.message}\n\n`;
        }
    }
    fs.writeFileSync('db1_hierarchy_details.txt', output);
    await s.close();
}

run();
