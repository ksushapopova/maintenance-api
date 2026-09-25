import { reportsService } from '../services/reports.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportsController = {
  equipmentLoad: asyncHandler(async (req, res) => {
    const q = req.validated?.query ?? req.query;
    const from = q.from ? new Date(q.from) : null;
    const to = q.to ? new Date(q.to) : null;
    const minRequests = q.minRequests ? Number(q.minRequests) : 0;

    const data = await reportsService.equipmentLoad({ from, to, minRequests });
    res.json({ data, total: data.length });
  }),

  siteSummary: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const data = await reportsService.siteSummary(id);
    res.json(data);
  }),
};