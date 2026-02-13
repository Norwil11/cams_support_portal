import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const DailyCamsConcern = sequelizeDB1.define('DailyCamsConcern', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    time_log: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    date: DataTypes.STRING,
    branch_code: DataTypes.STRING,
    concern_issue: DataTypes.TEXT,
    concerning_staff: DataTypes.STRING,
    designation: DataTypes.STRING,
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
    tableName: 'daily_cams_concern',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default DailyCamsConcern;
