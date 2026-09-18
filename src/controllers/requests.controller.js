import { requestsService } from '../services/requests.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function parseListQuery(q) {
  const page = Number(q.page) > 0 ? Number(q.page) : 1;
  const limit = Number(q.limit) > 0 ? Math.min(Number(q.limit), 100) : 10;

  const filters = {};
  if (q.equipmentId) filters.equipmentId = q.equipmentId;
  if (q.status) filters.status = q.status;
  if (q.priority) filters.priority = q.priority;
  if (q.plannedFrom) filters.plannedFrom = q.plannedFrom;
  if (q.plannedTo) filters.plannedTo = q.plannedTo;

  const sort = {};
  if (q.sort) {
    sort.field = q.sort;
    sort.order = q.order === 'desc' ? 'desc' : 'asc';
  }

  return { filters, sort, page, limit };
}

export const requestsController = {
  list: asyncHandler(async (req, res) => {
    const q = req.validated?.query ?? req.query;
    const result = await requestsService.list(parseListQuery(q));
    res.json(result);
  }),

  listByEquipment: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const q = req.validated?.query ?? req.query;
    const result = await requestsService.listByEquipmentId(id, parseListQuery(q));
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const item = await requestsService.getById(id);
    res.json(item);
  }),

  create: asyncHandler(async (req, res) => {
    const data = req.validated?.body ?? req.body;
    const item = await requestsService.create(data);
    res.status(201).location(`/api/requests/${item.id}`).json(item);
  }),

  update: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const patch = req.validated?.body ?? req.body;
    const item = await requestsService.update(id, patch);
    res.json(item);
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    const newStatus = req.validated?.body?.status ?? req.body.status;
    const item = await requestsService.changeStatus(id, newStatus);
    res.json(item);
  }),

  delete: asyncHandler(async (req, res) => {
    const id = req.validated?.params?.id ?? req.params.id;
    await requestsService.delete(id);
    res.status(204).end();
  }),
};