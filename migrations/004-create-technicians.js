export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('technicians', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      full_name: { type: Sequelize.STRING(200), allowNull: false },
      specialization: { type: Sequelize.STRING(120), allowNull: true },
      employee_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      created_at: {
        type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('technicians', ['employee_number'], {
      unique: true, name: 'technicians_employee_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('technicians');
  },
};
