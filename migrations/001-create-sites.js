export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sites', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lat: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      lon: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('sites', ['code'], {
      unique: true,
      name: 'sites_code_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sites');
  },
};