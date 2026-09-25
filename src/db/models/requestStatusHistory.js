import { DataTypes } from 'sequelize';

export default function defineRequestStatusHistory(sequelize) {
  const RequestStatusHistory = sequelize.define(
    'RequestStatusHistory',
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
      fromStatus: {
        type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
        allowNull: true,
        field: 'from_status',
      },
      toStatus: {
        type: DataTypes.ENUM('new', 'in_progress', 'done', 'rejected'),
        allowNull: false,
        field: 'to_status',
      },
      changedBy: {
        type: DataTypes.STRING(150),
        allowNull: true,
        field: 'changed_by',
      },
      comment: { type: DataTypes.TEXT, allowNull: true },
      changedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'changed_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'request_status_history',
      underscored: true,
      timestamps: false, 
    }
  );

  return RequestStatusHistory;
}