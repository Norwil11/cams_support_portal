import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const ResponsibleIncharge = sequelizeDB1.define('ResponsibleIncharge', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    division_id: {
        type: DataTypes.INTEGER,
        allowNull: true   // null = cluster head (handles an operation, not a specific division)
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'responsible_incharge',
    timestamps: false
});

export default ResponsibleIncharge;
