import { sequelizeDB1, sequelizeDB2 } from '../config/database.js';

// DB1 Models
import Division from './db1/Division.js';
import ResponsibleIncharge from './db1/ResponsibleIncharge.js';
import BranchDB1 from './db1/BranchDB1.js';
import AreaDB1 from './db1/AreaDB1.js';
import RegionDB1 from './db1/RegionDB1.js';
import OperationDB1 from './db1/OperationDB1.js';

// DB2 Models
import Branch from './db2/Branch.js';
import Area from './db2/Area.js';
import Region from './db2/Region.js';
import DivisionDB2 from './db2/DivisionDB2.js';
import Operation from './db2/Operation.js';
import MonthlySavedReport from './db2/MonthlySavedReport.js';
import DailySavedReport from './db2/DailySavedReport.js';
import Client from './db2/Client.js';
import ClientSavings from './db2/ClientSavings.js';
import UnclaimedAccount from './db2/UnclaimedAccount.js';
import BadDebt from './db2/BadDebt.js';

import DailyCamsConcern from './db1/DailyCamsConcern.js';
import CamsAdjustment from './db1/CamsAdjustment.js';
import StaffAccess from './db1/StaffAccess.js';
import CamsReopenDevsAdjustment from './db1/CamsReopenDevsAdjustment.js';

// --- Associations ---

// DB1 Associations
Division.hasOne(ResponsibleIncharge, { foreignKey: 'division_id', sourceKey: 'id' });
ResponsibleIncharge.belongsTo(Division, { foreignKey: 'division_id', targetKey: 'id' });

// Organizational Hierarchy (DB1)
const logModels = [StaffAccess, CamsAdjustment, CamsReopenDevsAdjustment, DailyCamsConcern];
logModels.forEach(Model => {
    Model.belongsTo(BranchDB1, { foreignKey: 'branch_code', targetKey: 'branch_no', as: 'hierarchy' });
});

BranchDB1.belongsTo(AreaDB1, { foreignKey: 'area_id', as: 'area' });
AreaDB1.belongsTo(RegionDB1, { foreignKey: 'region_id', as: 'region' });
AreaDB1.belongsTo(Division, { foreignKey: 'division_id', as: 'division' });
Division.belongsTo(OperationDB1, { foreignKey: 'operation_id', as: 'operation' });

// DB2 Associations (Organization Hierarchy)
Operation.hasMany(DivisionDB2, { foreignKey: 'operationID' });
DivisionDB2.belongsTo(Operation, { foreignKey: 'operationID' });

DivisionDB2.hasMany(Region, { foreignKey: 'divisionID' });
Region.belongsTo(DivisionDB2, { foreignKey: 'divisionID' });

Region.hasMany(Area, { foreignKey: 'region_id' });
Area.belongsTo(Region, { foreignKey: 'region_id' });

Area.hasMany(Branch, { foreignKey: 'AreaID' });
Branch.belongsTo(Area, { foreignKey: 'AreaID' });

// DB2 Associations (Reports)
Branch.hasMany(MonthlySavedReport, { foreignKey: 'branch_no', sourceKey: 'BranchNo' });
MonthlySavedReport.belongsTo(Branch, { foreignKey: 'branch_no', targetKey: 'BranchNo' });

Branch.hasMany(DailySavedReport, { foreignKey: 'branch_no', sourceKey: 'BranchNo' });
DailySavedReport.belongsTo(Branch, { foreignKey: 'branch_no', targetKey: 'BranchNo' });

// DB2 Associations (Client Data)
Client.hasOne(ClientSavings, { as: 'ClientSavings', foreignKey: 'clientRefNo' });
ClientSavings.belongsTo(Client, { foreignKey: 'clientRefNo' });

Client.hasOne(UnclaimedAccount, { as: 'UnclaimedAccount', foreignKey: 'clientRefNo' });
UnclaimedAccount.belongsTo(Client, { foreignKey: 'clientRefNo' });

Client.hasOne(BadDebt, { as: 'BadDebt', foreignKey: 'clientRefNo' });
BadDebt.belongsTo(Client, { foreignKey: 'clientRefNo' });


export {
    sequelizeDB1,
    sequelizeDB2,
    Division,
    ResponsibleIncharge,
    Branch,
    Area,
    Region,
    DivisionDB2,
    Operation,
    MonthlySavedReport,
    DailySavedReport,
    Client,
    ClientSavings,
    UnclaimedAccount,
    BadDebt,
    DailyCamsConcern,
    CamsAdjustment,
    StaffAccess,
    CamsReopenDevsAdjustment,
    BranchDB1,
    AreaDB1,
    RegionDB1,
    OperationDB1
};
