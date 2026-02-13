import { sequelizeDB1 } from './src/config/database.js';

const alterTables = async () => {
    const tables = ['staff_access', 'cams_adjustment', 'cams_reopen', 'daily_cams_concern'];

    try {
        console.log('Starting table alterations...');

        for (const table of tables) {
            console.log(`Checking table: ${table}...`);
            const [columns] = await sequelizeDB1.query(`DESCRIBE ${table}`);
            const columnNames = columns.map(c => c.Field.toLowerCase());

            if (!columnNames.includes('created_at')) {
                console.log(`Adding created_at to ${table}...`);
                await sequelizeDB1.query(`ALTER TABLE ${table} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
            } else {
                console.log(`created_at already exists in ${table}`);
            }

            if (!columnNames.includes('updated_at')) {
                console.log(`Adding updated_at to ${table}...`);
                await sequelizeDB1.query(`ALTER TABLE ${table} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
            } else {
                console.log(`updated_at already exists in ${table}`);
            }
        }

        console.log('Successfully updated all tables!');
        process.exit(0);
    } catch (error) {
        console.error('Error altering tables:', error.message);
        process.exit(1);
    }
};

alterTables();
