import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const OperationDB1 = sequelizeDB1.define('OperationDB1', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'operations',
    timestamps: false
});

export default OperationDB1;
