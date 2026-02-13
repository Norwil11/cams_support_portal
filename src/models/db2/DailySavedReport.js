import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const DailySavedReport = sequelizeDB2.define('DailySavedReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branch_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    transaction_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'daily_financial_statement_saved_reports',
    timestamps: false
});

export default DailySavedReport;
