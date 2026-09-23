export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('equipment_passports', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      equipment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'equipment', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      manufacturer: { type: Sequelize.STRING(200), allowNull: false },
      model: { type: Sequelize.STRING(200), allowNull: false },
      rated_power_kw: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      last_verified_at: { type: Sequelize.DATEONLY, allowNull: true },
      created_at: {
        type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('equipment_passports', ['equipment_id'], {
      unique: true, name: 'passport_equipment_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('equipment_passports');
  },
};
