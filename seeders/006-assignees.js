export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query('TRUNCATE request_assignees;');

    await queryInterface.sequelize.query(`
      INSERT INTO request_assignees (request_id, technician_id, role, hours)
      SELECT
        r.id,
        t.id,
        (CASE
           WHEN ROW_NUMBER() OVER (PARTITION BY r.id ORDER BY t.id) = 1
             THEN 'lead'
           ELSE 'member'
         END)::enum_request_assignees_role,
        4 + (ABS(hashtext(r.id::text || t.id::text)) % 8)
      FROM maintenance_requests r
      JOIN technicians t ON t.id IN (
        'a1111111-0000-0000-0000-000000000001',
        'a1111111-0000-0000-0000-000000000002',
        'a1111111-0000-0000-0000-000000000003'
      )
      WHERE r.status <> 'new';
    `);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('request_assignees', null, {});
  },
};
