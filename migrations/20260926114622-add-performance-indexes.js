export default {
  async up(queryInterface) {
    await queryInterface.addIndex('maintenance_requests', ['status', 'created_at'], {
      name: 'idx_requests_status_created_at',
    });

    await queryInterface.addIndex('equipment', ['site_id', 'status'], {
      name: 'idx_equipment_site_status',
    });

    await queryInterface.addIndex('maintenance_requests', ['equipment_id', 'status'], {
      name: 'idx_requests_equipment_status',
    });

    await queryInterface.addIndex('request_assignees', ['request_id'], {
      name: 'idx_assignees_request_id',
    });

    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await queryInterface.sequelize.query(
      'CREATE INDEX idx_requests_title_trgm ON maintenance_requests USING gin (title gin_trgm_ops);'
    );

  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_requests_title_trgm;');
    await queryInterface.removeIndex('maintenance_requests', 'idx_requests_equipment_status');
    await queryInterface.removeIndex('equipment', 'idx_equipment_site_status');
    await queryInterface.removeIndex('maintenance_requests', 'idx_requests_status_created_at');
    await queryInterface.removeIndex('request_assignees', 'idx_assignees_request_id');
  },
};
