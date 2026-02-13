import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const CamsAdjustment = sequelizeDB1.define('CamsAdjustment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    time_log: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    date_of_request: DataTypes.STRING,
    branch_code: DataTypes.STRING,
    concern_category: DataTypes.STRING,
    concerning_staff: DataTypes.STRING,
    client_reference: DataTypes.STRING,
    client_name: DataTypes.STRING,
    name_of_mfo: DataTypes.STRING,
    mfo: DataTypes.STRING,
    group_name: DataTypes.STRING,
    remarks: DataTypes.TEXT,
    incharge_id: DataTypes.INTEGER,
    responsible_incharge: DataTypes.STRING,
    jd_incharge: DataTypes.STRING,
    delay_cause: DataTypes.TEXT,
    status: {
        type: DataTypes.ENUM('Pending', 'Done', 'Need to update'),
        defaultValue: 'Need to update'
    }
}, {
    tableName: 'cams_adjustment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default CamsAdjustment;
