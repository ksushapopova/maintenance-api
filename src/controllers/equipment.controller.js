import { equipmentService } from '../services/equipment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function parseListQuery(q) {
  const page = Number(q.page) > 0 ? Number(q.page) : 1;
  const limit = Number(q.limit) > 0 ? Math.min(Number(q.limit), 100) : 10;

  const filters = {};
  if (q.status) filters.status = q.status;
  if (q.type) filters.type = q.type;
  if (q.search) filters.search = q.search;

  const sort = {};
  if (q.sort) {
    sort.field = q.sort;
    sort.order = q.order === 'desc' ? 'desc' : 'asc';
  }

  return { filters, sort, page, limit };
}

export const equipmentController = {
  list: asyncHandler(async (req, res) => {
    const q = req.validated?.query ?? req.query;
    const result = await equipmentService.list(parseListQuery(q));
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const item = await equipmentService.getById(id);
    res.json(item);
  }),

  create: asyncHandler(async (req, res) => {
    const data = req.validated?.body ?? req.body;
    const item = await equipmentService.create(data);
    res.status(201).location(`/api/equipment/${item.id}`).json(item);
  }),

  update: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const patch = req.validated?.body ?? req.body;
    const item = await equipmentService.update(id, patch);
    res.json(item);
  }),

  delete: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    await equipmentService.delete(id);
    res.status(204).end();
  }),
};