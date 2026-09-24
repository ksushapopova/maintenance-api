import { DataTypes } from 'sequelize';

export default function defineMaintenanceRequest(sequelize) {
  const MaintenanceRequest = sequelize.define(
    'MaintenanceRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'equipment_id',
      },
      title: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
        allowNull: false,
        defaultValue: 'new',
      },
      plannedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'planned_at',
      },
      author: { type: DataTypes.STRING(150), allowNull: true },
    },
    {
      tableName: 'maintenance_requests',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return MaintenanceRequest;
}