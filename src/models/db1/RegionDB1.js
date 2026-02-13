import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const RegionDB1 = sequelizeDB1.define('RegionDB1', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    division_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'regions',
    timestamps: false
});

export default RegionDB1;
