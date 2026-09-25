import { RequestAssignee, Technician, MaintenanceRequest } from '../db/models/index.js';
import { withSequelizeErrors } from './errors.js';

const TECHNICIAN_ATTRS = ['id', 'fullName', 'specialization', 'employeeNumber'];

export const assigneesRepository = {
  async listByRequest(requestId) {
    return RequestAssignee.findAll({
      where: { requestId },
      attributes: ['id', 'requestId', 'technicianId', 'role', 'hours'],
      include: [
        { model: Technician, as: 'technician', attributes: TECHNICIAN_ATTRS },
      ],
      order: [['role', 'ASC'], ['createdAt', 'ASC']],
    });
  },

  async findByRequestAndTechnician(requestId, technicianId) {
    return RequestAssignee.findOne({ where: { requestId, technicianId } });
  },

  async countByRequest(requestId) {
    return RequestAssignee.count({ where: { requestId } });
  },

  async countLeads(requestId) {
    return RequestAssignee.count({ where: { requestId, role: 'lead' } });
  },

  async replaceAll(requestId, assignees, transaction) {
    await RequestAssignee.destroy({ where: { requestId }, transaction });
    await RequestAssignee.bulkCreate(
      assignees.map((a) => ({
        requestId,
        technicianId: a.technicianId,
        role: a.role,
        hours: a.hours ?? 0,
      })),
      { transaction }
    );
  },

  async remove(requestId, technicianId) {
    return withSequelizeErrors(async () => {
      const count = await RequestAssignee.destroy({
        where: { requestId, technicianId },
      });
      return count > 0;
    });
  },
};