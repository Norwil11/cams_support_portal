import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Database 1: CSP / Incharge Database
const sequelizeDB1 = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: console.log, // Set to console.log to see SQL queries
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Database 2: CBSDB / Operations Database
const sequelizeDB2 = new Sequelize(
    process.env.DB2_NAME,
    process.env.DB2_USER,
    process.env.DB2_PASSWORD,
    {
        host: process.env.DB2_HOST,
        port: process.env.DB2_PORT,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

export { sequelizeDB1, sequelizeDB2 };
