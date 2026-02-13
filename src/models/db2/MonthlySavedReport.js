import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const MonthlySavedReport = sequelizeDB2.define('MonthlySavedReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branch_no: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'financial_statement_saved_reports',
    timestamps: false
});

export default MonthlySavedReport;
