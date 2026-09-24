export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('technicians', [
      { id: 'a1111111-0000-0000-0000-000000000001', full_name: 'Иванов Иван Иванович', specialization: 'Механик', employee_number: 'EMP-001' },
      { id: 'a1111111-0000-0000-0000-000000000002', full_name: 'Петров Пётр Петрович', specialization: 'Электрик', employee_number: 'EMP-002' },
      { id: 'a1111111-0000-0000-0000-000000000003', full_name: 'Сидорова Анна Сергеевна', specialization: 'Инженер-диагност', employee_number: 'EMP-003' },
      { id: 'a1111111-0000-0000-0000-000000000004', full_name: 'Кузнецов Олег Львович', specialization: 'Слесарь', employee_number: 'EMP-004' },
      { id: 'a1111111-0000-0000-0000-000000000005', full_name: 'Морозова Елена Ивановна', specialization: 'Инженер-электроник', employee_number: 'EMP-005' },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('technicians', {
      employee_number: ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005'],
    });
  },
};
