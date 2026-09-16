import { equipmentRepository } from '../repositories/equipment.repository.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

export const equipmentService = {
  async list(query) {
    return equipmentRepository.findAll(query);
  },

  async getById(id) {
    const item = await equipmentRepository.findById(id);
    if (!item) throw new NotFoundError(`Оборудование ${id} не найдено`);
    return item;
  },

  async create(data) {
    const existing = await equipmentRepository.findBySerialNumber(data.serialNumber);
    if (existing) {
      throw new ConflictError(`Серийный номер ${data.serialNumber} уже занят`);
    }
    return equipmentRepository.create(data);
  },

  async update(id, patch) {
    await this.getById(id); 
    return equipmentRepository.update(id, patch);
  },

  async delete(id) {
    await this.getById(id);
    return equipmentRepository.delete(id);
  },
};