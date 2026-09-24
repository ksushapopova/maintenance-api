import { DataTypes } from 'sequelize';

export default function defineEquipmentPassport(sequelize) {
  const EquipmentPassport = sequelize.define(
    'EquipmentPassport',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'equipment_id',
      },
      manufacturer: { type: DataTypes.STRING(200), allowNull: false },
      model: { type: DataTypes.STRING(200), allowNull: false },
      ratedPowerKw: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'rated_power_kw',
      },
      lastVerifiedAt: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'last_verified_at',
      },
    },
    {
      tableName: 'equipment_passports',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return EquipmentPassport;
}