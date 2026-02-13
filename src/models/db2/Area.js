import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const Area = sequelizeDB2.define('Area', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    area_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    region_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'area',
    timestamps: false
});

export default Area;
