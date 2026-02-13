import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const BadDebt = sequelizeDB2.define('BadDebt', {
    clientRefNo: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    branchNo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    clientName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    savings: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    bad_debts: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    net_risk: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    date_closed: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_paid: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    date_paid: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'bad_debts',
    timestamps: false
});

export default BadDebt;
