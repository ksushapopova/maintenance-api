import { Op } from 'sequelize';

import {
  Equipment,
  Site,
  EquipmentPassport,
  MaintenanceRequest,
} from '../db/models/index.js';
import { withSequelizeErrors } from './errors.js';

const SORTABLE = ['name', 'serialNumber', 'status', 'installedAt', 'createdAt'];

function buildOrder(sort) {
  const field = sort?.field && SORTABLE.includes(sort.field) ? sort.field : 'createdAt';
  const dir = sort?.order === 'desc' ? 'DESC' : 'ASC';
  return [[field, dir]];
}

const EQUIPMENT_ATTRIBUTES = [
  'id', 'siteId', 'name', 'type', 'serialNumber', 'status', 'installedAt',
  'createdAt', 'updatedAt',
];

const SITE_ATTRIBUTES = ['id', 'name', 'code', 'region', 'lat', 'lon'];

const PASSPORT_ATTRIBUTES = [
  'id', 'equipmentId', 'manufacturer', 'model', 'ratedPowerKw', 'lastVerifiedAt',
];

export const equipmentRepository = {
  async findAll({ filters = {}, sort = {}, page = 1, limit = 10 }) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.siteId) where.siteId = filters.siteId;
    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { serialNumber: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Equipment.findAndCountAll({
      where,
      attributes: EQUIPMENT_ATTRIBUTES,
      include: [
        { model: Site, as: 'site', attributes: SITE_ATTRIBUTES },
        {
          model: EquipmentPassport, as: 'passport',
          attributes: PASSPORT_ATTRIBUTES, required: false,
        },
      ],
      order: buildOrder(sort),
      limit,
      offset,
      distinct: true,
    });

    return { data: rows, total: count, page, limit };
  },

  async findById(id) {
    return Equipment.findByPk(id, {
      attributes: EQUIPMENT_ATTRIBUTES,
      include: [
        { model: Site, as: 'site', attributes: SITE_ATTRIBUTES },
        {
          model: EquipmentPassport, as: 'passport',
          attributes: PASSPORT_ATTRIBUTES, required: false,
        },
      ],
    });
  },

  async findBySerialNumber(serialNumber) {
    return Equipment.findOne({
      where: { serialNumber },
      attributes: EQUIPMENT_ATTRIBUTES,
    });
  },

  async create(data) {
    return withSequelizeErrors(() =>
      Equipment.create({
        siteId: data.siteId,
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        status: data.status,
        installedAt: data.installedAt,
      })
    );
  },

  async update(id, patch) {
    return withSequelizeErrors(async () => {
      const item = await Equipment.findByPk(id);
      if (!item) return null;
      const allowed = ['name', 'type', 'serialNumber', 'status', 'installedAt', 'siteId'];
      for (const key of allowed) {
        if (patch[key] !== undefined) item[key] = patch[key];
      }
      await item.save();
      return item;
    });
  },

  async delete(id) {
    return withSequelizeErrors(async () => {
      const count = await Equipment.destroy({ where: { id } });
      return count > 0;
    });
  },

  async countOpenRequests(equipmentId) {
    return MaintenanceRequest.count({
      where: {
        equipmentId,
        status: { [Op.in]: ['new', 'in_progress'] },
      },
    });
  },
};