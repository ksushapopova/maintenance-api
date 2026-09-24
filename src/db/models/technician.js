import { DataTypes } from 'sequelize';

export default function defineTechnician(sequelize) {
  const Technician = sequelize.define(
    'Technician',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        field: 'full_name',
      },
      specialization: { type: DataTypes.STRING(120), allowNull: true },
      employeeNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'employee_number',
      },
    },
    {
      tableName: 'technicians',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Technician;
}