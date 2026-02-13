import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const AreaDB1 = sequelizeDB1.define('AreaDB1', {
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
    },
    division_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'areas',
    timestamps: false
});

export default AreaDB1;
