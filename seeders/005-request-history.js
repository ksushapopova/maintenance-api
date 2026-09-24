export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query('TRUNCATE request_status_history;');

    await queryInterface.sequelize.query(`
      INSERT INTO request_status_history
        (request_id, from_status, to_status, changed_by, comment, changed_at)
      SELECT
        id,
        NULL,
        'new'::enum_request_status_history_to_status,
        author,
        'Заявка создана',
        created_at
      FROM maintenance_requests;
    `);

    await queryInterface.sequelize.query(`
      INSERT INTO request_status_history
        (request_id, from_status, to_status, changed_by, comment, changed_at)
      SELECT
        id,
        'new'::enum_request_status_history_from_status,
        status::text::enum_request_status_history_to_status,
        author,
        'Финальный статус',
        updated_at
      FROM maintenance_requests
      WHERE status <> 'new';
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('request_status_history', null, {});
  },
};