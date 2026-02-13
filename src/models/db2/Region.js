import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const Region = sequelizeDB2.define('Region', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    region: {
        type: DataTypes.STRING,
        allowNull: false
    },
    divisionID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'region',
    timestamps: false
});

export default Region;
