import { reportsRepository } from '../repositories/reports.repository.js';
import { equipmentRepository } from '../repositories/equipment.repository.js';
import { NotFoundError } from '../errors/index.js';

export const reportsService = {
  async equipmentLoad({ from, to, minRequests = 0 }) {
    return reportsRepository.equipmentLoad({ from, to, minRequests });
  },

  async siteSummary(siteId) {
    const { Site } = await import('../db/models/index.js');
    const site = await Site.findByPk(siteId);
    if (!site) throw new NotFoundError(`Площадка ${siteId} не найдена`);

    const summary = await reportsRepository.siteSummary(siteId);
    return {
      site: {
        id: site.id,
        code: site.code,
        name: site.name,
        region: site.region,
      },
      ...summary,
    };
  },
};