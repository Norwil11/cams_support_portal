import { DataTypes } from 'sequelize';
import { sequelizeDB2 } from '../../config/database.js';

const Client = sequelizeDB2.define('Client', {
    clientRefNo: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    branchNo: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    middleName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    birthdate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    close_status: {
        type: DataTypes.STRING,
        allowNull: true
    },
    membershipDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    closedOn: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'closedON'
    },
    contactNo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mobileNo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    landlineNo: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'clients',
    timestamps: false
});

export default Client;
