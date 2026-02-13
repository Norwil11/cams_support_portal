import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const Operation = sequelizeDB2.define('Operation', {
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

export default Operation;
