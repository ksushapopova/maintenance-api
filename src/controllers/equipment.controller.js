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
    const result = await equipmentService.list(parseListQuery(req.query));
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const item = await equipmentService.getById(req.params.id);
    res.json(item);
  }),

  create: asyncHandler(async (req, res) => {
    const item = await equipmentService.create(req.body);
    res
      .status(201)
      .location(`/api/equipment/${item.id}`)
      .json(item);
  }),

  update: asyncHandler(async (req, res) => {
    const item = await equipmentService.update(req.params.id, req.body);
    res.json(item);
  }),

  delete: asyncHandler(async (req, res) => {
    await equipmentService.delete(req.params.id);
    res.status(204).end();
  }),
};