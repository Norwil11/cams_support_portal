import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const UnclaimedAccount = sequelizeDB2.define('UnclaimedAccount', {
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
    unclaimed_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    date_closed: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    is_claimed: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    date_claimed: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'unclaimed_accounts',
    timestamps: false
});

export default UnclaimedAccount;
