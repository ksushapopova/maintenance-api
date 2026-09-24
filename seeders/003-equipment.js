export default {
  async up(queryInterface) {
    const equipment = [
      { id: 'e1111111-0000-0000-0000-000000000001', site_id: '11111111-1111-1111-1111-111111111111', name: 'Ветрогенератор A1', type: 'turbine',    serial_number: 'WT-A1-0001', status: 'operational',    installed_at: new Date('2022-05-10') },
      { id: 'e1111111-0000-0000-0000-000000000002', site_id: '11111111-1111-1111-1111-111111111111', name: 'Ветрогенератор A2', type: 'turbine',    serial_number: 'WT-A2-0002', status: 'maintenance',    installed_at: new Date('2022-06-15') },
      { id: 'e1111111-0000-0000-0000-000000000003', site_id: '11111111-1111-1111-1111-111111111111', name: 'Инвертор I1',        type: 'inverter',   serial_number: 'INV-I1-0003', status: 'operational',   installed_at: new Date('2023-01-20') },
      { id: 'e1111111-0000-0000-0000-000000000004', site_id: '22222222-2222-2222-2222-222222222222', name: 'Инвертор I2',        type: 'inverter',   serial_number: 'INV-I2-0004', status: 'fault',         installed_at: new Date('2023-03-05') },
      { id: 'e1111111-0000-0000-0000-000000000005', site_id: '22222222-2222-2222-2222-222222222222', name: 'Датчик D1',         type: 'sensor',     serial_number: 'SNS-D1-0005', status: 'operational',   installed_at: new Date('2023-07-12') },
      { id: 'e1111111-0000-0000-0000-000000000006', site_id: '22222222-2222-2222-2222-222222222222', name: 'Подстанция S1',     type: 'substation', serial_number: 'SUB-S1-0006', status: 'decommissioned',installed_at: new Date('2020-11-01') },
    ];

    const passports = [
      { equipment_id: 'e1111111-0000-0000-0000-000000000001', manufacturer: 'Vestas',     model: 'V150-4.2', rated_power_kw: 4200, last_verified_at: '2025-04-01' },
      { equipment_id: 'e1111111-0000-0000-0000-000000000002', manufacturer: 'Vestas',     model: 'V150-4.2', rated_power_kw: 4200, last_verified_at: '2025-04-01' },
      { equipment_id: 'e1111111-0000-0000-0000-000000000003', manufacturer: 'SMA',        model: 'Sunny Tripower', rated_power_kw: 50, last_verified_at: '2025-02-15' },
      { equipment_id: 'e1111111-0000-0000-0000-000000000004', manufacturer: 'Huawei',     model: 'SUN2000-100KTL', rated_power_kw: 100, last_verified_at: '2024-12-10' },
      { equipment_id: 'e1111111-0000-0000-0000-000000000005', manufacturer: 'Bosch',      model: 'BME280',   rated_power_kw: 0.01, last_verified_at: '2025-06-01' },
      { equipment_id: 'e1111111-0000-0000-0000-000000000006', manufacturer: 'ABB',        model: 'Sub-35kV', rated_power_kw: 35000, last_verified_at: '2024-05-20' },
    ];

    await queryInterface.bulkInsert('equipment', equipment);
    await queryInterface.bulkInsert('equipment_passports', passports);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('equipment_passports', null, {});
    await queryInterface.bulkDelete('equipment', null, {});
  },
};
