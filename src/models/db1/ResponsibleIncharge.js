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
        allowNull: false
    }
}, {
    tableName: 'responsible_incharge',
    timestamps: false
});

export default ResponsibleIncharge;
