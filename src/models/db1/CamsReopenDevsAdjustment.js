import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const CamsReopenDevsAdjustment = sequelizeDB1.define('CamsReopenDevsAdjustment', {
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
    time_of_request: DataTypes.STRING,
    adjustment_point: DataTypes.STRING,
    requested_by: DataTypes.STRING,
    concern_category: DataTypes.STRING,
    reason_for_reopening: DataTypes.TEXT,
    recommended_by: DataTypes.STRING,
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
    tableName: 'cams_reopen',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default CamsReopenDevsAdjustment;
