import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const Division = sequelizeDB1.define('Division', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    division: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operation_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'divisions',
    timestamps: false
});

export default Division;
