import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const BranchDB1 = sequelizeDB1.define('BranchDB1', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    branch_no: {
        type: DataTypes.STRING,
        allowNull: false
    },
    branch_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    area_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'branches',
    timestamps: false
});

export default BranchDB1;
