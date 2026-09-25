import { Op } from 'sequelize';

import {
  MaintenanceRequest,
  Equipment,
  Site,
  RequestAssignee,
  Technician,
} from '../db/models/index.js';
import { withSequelizeErrors } from './errors.js';

const SORTABLE = ['title', 'priority', 'status', 'planned_at', 'created_at'];

function buildOrder(sort) {
  const field = sort?.field && SORTABLE.includes(sort.field) ? sort.field : 'createdAt';
  const dir = sort?.order === 'desc' ? 'DESC' : 'ASC';
  return [[field, dir]];
}

const REQUEST_ATTRIBUTES = [
  'id', 'equipmentId', 'title', 'description', 'priority', 'status',
  'plannedAt', 'author', 'createdAt', 'updatedAt',
];

const EQUIPMENT_SHORT = ['id', 'name', 'type', 'serialNumber', 'status'];

function baseInclude() {
  return [
    {
      model: Equipment,
      as: 'equipment',
      attributes: EQUIPMENT_SHORT,
      include: [{ model: Site, as: 'site', attributes: ['id', 'code', 'name'] }],
    },
    {
      model: RequestAssignee,
      as: 'assignments',
      attributes: ['id', 'technicianId', 'role', 'hours'],
      include: [
        {
          model: Technician,
          as: 'technician',
          attributes: ['id', 'fullName', 'specialization', 'employeeNumber'],
        },
      ],
    },
  ];
}

export const requestsRepository = {
  async findAll({ filters = {}, sort = {}, page = 1, limit = 10 }) {
    const where = {};
    if (filters.equipmentId) where.equipmentId = filters.equipmentId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.plannedFrom || filters.plannedTo) {
      where.plannedAt = {};
      if (filters.plannedFrom) where.plannedAt[Op.gte] = filters.plannedFrom;
      if (filters.plannedTo) where.plannedAt[Op.lte] = filters.plannedTo;
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await MaintenanceRequest.findAndCountAll({
      where,
      attributes: REQUEST_ATTRIBUTES,
      include: baseInclude(),
      order: buildOrder(sort),
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, total: count, page, limit };
  },

  async findById(id) {
    return MaintenanceRequest.findByPk(id, {
      attributes: REQUEST_ATTRIBUTES,
      include: baseInclude(),
    });
  },

  async findByEquipmentId(equipmentId, query = {}) {
    return this.findAll({
      ...query,
      filters: { ...(query.filters ?? {}), equipmentId },
    });
  },

  async findOpenByEquipmentId(equipmentId) {
    return MaintenanceRequest.findAll({
      where: {
        equipmentId,
        status: { [Op.in]: ['new', 'in_progress'] },
      },
      attributes: ['id'],
    });
  },

  async create(data) {
    return withSequelizeErrors(() =>
      MaintenanceRequest.create({
        equipmentId: data.equipmentId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status ?? 'new',
        plannedAt: data.plannedAt,
        author: data.author ?? 'system',
      })
    );
  },

  async update(id, patch) {
    return withSequelizeErrors(async () => {
      const item = await MaintenanceRequest.findByPk(id);
      if (!item) return null;
      const allowed = ['title', 'description', 'priority', 'plannedAt'];
      for (const key of allowed) {
        if (patch[key] !== undefined) item[key] = patch[key];
      }
      await item.save();
      return item;
    });
  },

  async delete(id) {
    return withSequelizeErrors(async () => {
      const count = await MaintenanceRequest.destroy({ where: { id } });
      return count > 0;
    });
  },
};