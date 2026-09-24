import { DataTypes } from 'sequelize';

export default function defineRequestAssignee(sequelize) {
  const RequestAssignee = sequelize.define(
    'RequestAssignee',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      requestId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'request_id',
      },
      technicianId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'technician_id',
      },
      role: {
        type: DataTypes.ENUM('lead', 'member'),
        allowNull: false,
      },
      hours: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'request_assignees',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        { unique: true, fields: ['request_id', 'technician_id'] },
      ],
    }
  );

  return RequestAssignee;
}