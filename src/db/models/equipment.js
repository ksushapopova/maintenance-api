import { DataTypes } from 'sequelize';

export default function defineEquipment(sequelize) {
  const Equipment = sequelize.define(
    'Equipment',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      siteId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'site_id',
      },
      name: { type: DataTypes.STRING(200), allowNull: false },
      type: {
        type: DataTypes.ENUM('turbine', 'inverter', 'sensor', 'substation'),
        allowNull: false,
      },
      serialNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        field: 'serial_number',
      },
      status: {
        type: DataTypes.ENUM('operational', 'maintenance', 'fault', 'decommissioned'),
        allowNull: false,
        defaultValue: 'operational',
      },
      installedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'installed_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
        },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'updated_at',
        defaultValue: DataTypes.NOW,
        },
    },
    {
      tableName: 'equipment',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Equipment;
}