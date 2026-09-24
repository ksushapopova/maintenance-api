export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      TRUNCATE request_assignees, request_status_history, maintenance_requests,
               equipment_passports, equipment, technicians, sites
      RESTART IDENTITY CASCADE;
    `);
    
    await queryInterface.bulkInsert('sites', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Ветропарк Северный',
        code: 'WP-NORTH',
        region: 'Мурманская область',
        lat: 68.9700,
        lon: 33.0800,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Солнечная станция Южная',
        code: 'SP-SOUTH',
        region: 'Краснодарский край',
        lat: 45.0355,
        lon: 38.9753,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('sites', {
      id: [
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
      ],
    });
  },
};
