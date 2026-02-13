import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const DivisionDB2 = sequelizeDB2.define('DivisionDB2', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    division: {
        type: DataTypes.STRING,
        allowNull: false
    },
    operationID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'division',
    timestamps: false
});

export default DivisionDB2;
