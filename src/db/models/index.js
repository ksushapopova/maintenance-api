import { sequelize } from '../index.js';

import defineSite from './site.js';
import defineEquipment from './equipment.js';
import defineEquipmentPassport from './equipmentPassport.js';
import defineTechnician from './technician.js';
import defineMaintenanceRequest from './maintenanceRequest.js';
import defineRequestStatusHistory from './requestStatusHistory.js';
import defineRequestAssignee from './requestAssignee.js';

const Site = defineSite(sequelize);
const Equipment = defineEquipment(sequelize);
const EquipmentPassport = defineEquipmentPassport(sequelize);
const Technician = defineTechnician(sequelize);
const MaintenanceRequest = defineMaintenanceRequest(sequelize);
const RequestStatusHistory = defineRequestStatusHistory(sequelize);
const RequestAssignee = defineRequestAssignee(sequelize);

Site.hasMany(Equipment, { foreignKey: 'site_id', as: 'equipment' });
Equipment.belongsTo(Site, { foreignKey: 'site_id', as: 'site' });

Equipment.hasOne(EquipmentPassport, {
  foreignKey: 'equipment_id',
  as: 'passport',
  onDelete: 'CASCADE',
});
EquipmentPassport.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment',
});

Equipment.hasMany(MaintenanceRequest, {
  foreignKey: 'equipment_id',
  as: 'requests',
});
MaintenanceRequest.belongsTo(Equipment, {
  foreignKey: 'equipment_id',
  as: 'equipment',
});

MaintenanceRequest.hasMany(RequestStatusHistory, {
  foreignKey: 'request_id',
  as: 'history',
  onDelete: 'CASCADE',
});
RequestStatusHistory.belongsTo(MaintenanceRequest, {
  foreignKey: 'request_id',
  as: 'request',
});

MaintenanceRequest.belongsToMany(Technician, {
  through: RequestAssignee,
  foreignKey: 'request_id',
  otherKey: 'technician_id',
  as: 'assignees',
});
Technician.belongsToMany(MaintenanceRequest, {
  through: RequestAssignee,
  foreignKey: 'technician_id',
  otherKey: 'request_id',
  as: 'requests',
});

RequestAssignee.belongsTo(MaintenanceRequest, {
  foreignKey: 'request_id',
  as: 'request',
});
RequestAssignee.belongsTo(Technician, {
  foreignKey: 'technician_id',
  as: 'technician',
});
MaintenanceRequest.hasMany(RequestAssignee, {
  foreignKey: 'request_id',
  as: 'assignments',
});

export {
  sequelize,
  Site,
  Equipment,
  EquipmentPassport,
  Technician,
  MaintenanceRequest,
  RequestStatusHistory,
  RequestAssignee,
};