import Joi from 'joi';
import { idParam, paginationQuery } from './common.js';

const priorities = ['low', 'medium', 'high', 'critical'];
const statuses = ['new', 'in_progress', 'done', 'rejected'];

export const createRequestSchema = {
  body: Joi.object({
    equipmentId: Joi.string().uuid().required(),
    title: Joi.string().min(5).max(120).required(),
    description: Joi.string().max(2000).allow(''),
    priority: Joi.string().valid(...priorities).required(),
    plannedAt: Joi.date().iso().optional(),
  }),
};

export const updateRequestSchema = {
  params: Joi.object({ id: idParam }),
  body: Joi.object({
    title: Joi.string().min(5).max(120),
    description: Joi.string().max(2000).allow(''),
    priority: Joi.string().valid(...priorities),
    plannedAt: Joi.date().iso(),
  }).min(1),
};

export const changeStatusSchema = {
  params: Joi.object({ id: idParam }),
  body: Joi.object({
    status: Joi.string().valid(...statuses).required(),
  }),
};

export const listRequestSchema = {
  query: Joi.object({
    ...paginationQuery,
    equipmentId: Joi.string().uuid(),
    status: Joi.string().valid(...statuses),
    priority: Joi.string().valid(...priorities),
    plannedFrom: Joi.date().iso(),
    plannedTo: Joi.date().iso(),
  }),
};

export const idParamSchema = {
  params: Joi.object({ id: idParam }),
};

export const assignTeamSchema = {
  params: Joi.object({ id: idParam }),
  body: Joi.object({
    assignees: Joi.array()
      .items(
        Joi.object({
          technicianId: Joi.string().uuid().required(),
          role: Joi.string().valid('lead', 'member').required(),
          hours: Joi.number().min(0).max(1000).default(0),
        })
      )
      .min(1)
      .required(),
  }),
};

export const assigneeParamsSchema = {
  params: Joi.object({
    id: idParam,
    userId: Joi.string().uuid().required(),
  }),
};