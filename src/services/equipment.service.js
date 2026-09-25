import { Op } from 'sequelize';
import { equipmentRepository } from '../repositories/equipment.repository.js';
import { requestsRepository } from '../repositories/requests.repository.js';
import { Site } from '../db/models/index.js';
import { NotFoundError, ConflictError } from '../errors/index.js';

async function findOrCreateSiteByLocation({ lat, lon }) {
  const existing = await Site.findOne({
    where: { lat, lon },
  });
  if (existing) return existing;

  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return Site.create({
    name: `Импортированная площадка ${suffix}`,
    code: `AUTO-${suffix}`,
    region: '—',
    lat,
    lon,
  });
}

function toApiShape(equipment) {
  const plain = equipment.toJSON ? equipment.toJSON() : equipment;
  const site = plain.site;
  return {
    id: plain.id,
    siteId: plain.siteId,
    name: plain.name,
    type: plain.type,
    serialNumber: plain.serialNumber,
    status: plain.status,
    installedAt: plain.installedAt,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    location: site ? { lat: Number(site.lat), lon: Number(site.lon) } : null,
    site: site ?? undefined,
    passport: plain.passport ?? undefined,
  };
}

export const equipmentService = {
  async list(query) {
    const result = await equipmentRepository.findAll(query);
    return {
      ...result,
      data: result.data.map(toApiShape),
    };
  },

  async getById(id) {
    const item = await equipmentRepository.findById(id);
    if (!item) throw new NotFoundError(`Оборудование ${id} не найдено`);
    return toApiShape(item);
  },

  async create(data) {
    const existing = await equipmentRepository.findBySerialNumber(data.serialNumber);
    if (existing) {
      throw new ConflictError(`Серийный номер ${data.serialNumber} уже занят`);
    }

    let siteId = data.siteId;
    if (!siteId && data.location) {
      const site = await findOrCreateSiteByLocation(data.location);
      siteId = site.id;
    }

    const created = await equipmentRepository.create({ ...data, siteId });
    const withSite = await equipmentRepository.findById(created.id);
    return toApiShape(withSite);
  },

  async update(id, patch) {
    await this.getById(id);

    let siteId = patch.siteId;
    if (!siteId && patch.location) {
      const site = await findOrCreateSiteByLocation(patch.location);
      siteId = site.id;
    }

    await equipmentRepository.update(id, { ...patch, siteId });
    const updated = await equipmentRepository.findById(id);
    return toApiShape(updated);
  },

  async delete(id) {
    await this.getById(id);
    const open = await requestsRepository.findOpenByEquipmentId(id);
    if (open.length > 0) {
      throw new ConflictError(`Нельзя удалить оборудование: есть открытые заявки (${open.length})`);
    }
    return equipmentRepository.delete(id);
  },
};