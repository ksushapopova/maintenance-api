import { RequestStatusHistory } from '../db/models/index.js';

export const historyRepository = {
  async listByRequest(requestId) {
    return RequestStatusHistory.findAll({
      where: { requestId },
      attributes: ['id', 'requestId', 'fromStatus', 'toStatus', 'changedBy', 'comment', 'changedAt'],
      order: [['changedAt', 'ASC']],
    });
  },

  async create(entry, transaction) {
    return RequestStatusHistory.create(entry, { transaction });
  },
};