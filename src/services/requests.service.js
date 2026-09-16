import { requestsRepository } from '../repositories/requests.repository.js';
import { equipmentRepository } from '../repositories/equipment.repository.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

const ALLOWED_TRANSITIONS = {
  new: ['in_progress', 'rejected'],
  in_progress: ['done', 'rejected'],
  done: [],
  rejected: [],
};

export const requestsService = {
  async list(query) {
    return requestsRepository.findAll(query);
  },

  async listByEquipmentId(equipmentId, query) {
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) throw new NotFoundError(`Оборудование ${equipmentId} не найдено`);
    return requestsRepository.findByEquipmentId(equipmentId, query);
  },

  async getById(id) {
    const item = await requestsRepository.findById(id);
    if (!item) throw new NotFoundError(`Заявка ${id} не найдена`);
    return item;
  },

  async create(data) {
    const equipment = await equipmentRepository.findById(data.equipmentId);
    if (!equipment) {
      throw new NotFoundError(`Оборудование ${data.equipmentId} не найдено`);
    }
    return requestsRepository.create(data);
  },

  async update(id, patch) {
    await this.getById(id);
    const { status, ...safePatch } = patch;
    return requestsRepository.update(id, safePatch);
  },

  async changeStatus(id, newStatus) {
    const request = await this.getById(id);
    const allowed = ALLOWED_TRANSITIONS[request.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Недопустимый переход статуса: ${request.status} → ${newStatus}`
      );
    }
    return requestsRepository.update(id, { status: newStatus });
  },

  async delete(id) {
    await this.getById(id);
    return requestsRepository.delete(id);
  },
};