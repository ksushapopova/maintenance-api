import { Op } from 'sequelize';
import { sequelize } from '../db/index.js';
import { requestsRepository } from '../repositories/requests.repository.js';
import { equipmentRepository } from '../repositories/equipment.repository.js';
import { assigneesRepository } from '../repositories/assignees.repository.js';
import { historyRepository } from '../repositories/history.repository.js';
import { Technician, MaintenanceRequest } from '../db/models/index.js';
import { NotFoundError, ConflictError, ValidationError } from '../errors/index.js';

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
    if (!equipment) throw new NotFoundError(`Оборудование ${data.equipmentId} не найдено`);

    return sequelize.transaction(async (t) => {
      const request = await requestsRepository.create(data);
      await historyRepository.create(
        {
          requestId: request.id,
          fromStatus: null,
          toStatus: 'new',
          changedBy: data.author ?? 'system',
          comment: 'Заявка создана',
          changedAt: new Date(),
        },
        t
      );
      return request;
    });
  },

  async update(id, patch) {
    await this.getById(id);
    const { status, ...safePatch } = patch; 
    return requestsRepository.update(id, safePatch);
  },

  async changeStatus(id, newStatus, changedBy = 'system', comment = null) {
    return sequelize.transaction(async (t) => {
      const request = await MaintenanceRequest.findByPk(id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!request) throw new NotFoundError(`Заявка ${id} не найдена`);

      const allowed = ALLOWED_TRANSITIONS[request.status] ?? [];
      if (!allowed.includes(newStatus)) {
        throw new ConflictError(`Недопустимый переход: ${request.status} → ${newStatus}`);
      }

      if (newStatus === 'in_progress') {
        const count = await assigneesRepository.countByRequest(id);
        if (count === 0) {
          throw new ConflictError('Нельзя перевести в in_progress без назначенных исполнителей');
        }
      }

      const fromStatus = request.status;
      request.status = newStatus;
      await request.save({ transaction: t });

      await historyRepository.create(
        {
          requestId: id,
          fromStatus,
          toStatus: newStatus,
          changedBy,
          comment,
          changedAt: new Date(),
        },
        t
      );

      return request;
    });
  },

  async delete(id) {
    await this.getById(id);
    return requestsRepository.delete(id);
  },

  async listAssignees(requestId) {
    await this.getById(requestId);
    return assigneesRepository.listByRequest(requestId);
  },

  async assignTeam(requestId, assignees) {
    return sequelize.transaction(async (t) => {
      const request = await MaintenanceRequest.findByPk(requestId, {
        transaction: t, lock: t.LOCK.UPDATE,
      });
      if (!request) throw new NotFoundError(`Заявка ${requestId} не найдена`);

      if (!Array.isArray(assignees) || assignees.length === 0) {
        throw new ValidationError('Список исполнителей пуст', [
          { field: 'assignees', message: 'Нужен хотя бы один исполнитель' },
        ]);
      }
      const leads = assignees.filter((a) => a.role === 'lead');
      if (leads.length !== 1) {
        throw new ValidationError('Должен быть ровно один lead', [
          { field: 'assignees', message: 'Ровно один специалист с ролью lead' },
        ]);
      }
      const ids = assignees.map((a) => a.technicianId);
      if (new Set(ids).size !== ids.length) {
        throw new ValidationError('Дубли специалистов в списке', [
          { field: 'assignees', message: 'Специалисты не должны повторяться' },
        ]);
      }

      const techs = await Technician.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: ['id'],
        transaction: t,
      });
      if (techs.length !== ids.length) {
        throw new NotFoundError('Один или несколько специалистов не найдены');
      }

      await assigneesRepository.replaceAll(requestId, assignees, t);
      return assigneesRepository.listByRequest(requestId);
    });
  },

  async removeAssignee(requestId, technicianId) {
    await this.getById(requestId);
    const removed = await assigneesRepository.remove(requestId, technicianId);
    if (!removed) throw new NotFoundError('Назначение не найдено');
    return true;
  },

  async listHistory(requestId) {
    await this.getById(requestId);
    return historyRepository.listByRequest(requestId);
  },
};