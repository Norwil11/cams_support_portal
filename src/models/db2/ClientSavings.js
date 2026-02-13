import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const ClientSavings = sequelizeDB2.define('ClientSavings', {
    clientRefNo: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    cbu: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    lcbu: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'client_savings',
    timestamps: false
});

export default ClientSavings;
