import { DataTypes } from 'sequelize';
import { sequelizeDB1 } from '../../config/database.js';

const StaffAccess = sequelizeDB1.define('StaffAccess', {
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
    concern_details: DataTypes.TEXT,
    concerning_staff: DataTypes.STRING,
    staff_name: DataTypes.STRING,
    id_number: DataTypes.STRING,
    corporate_email: DataTypes.STRING,
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
    tableName: 'staff_access',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default StaffAccess;
