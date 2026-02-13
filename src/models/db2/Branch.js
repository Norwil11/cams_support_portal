import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const Branch = sequelizeDB2.define('Branch', {
    BranchNo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Branch: {
        type: DataTypes.STRING,
        allowNull: false
    },
    AreaID: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'branches',
    timestamps: false
});

export default Branch;
