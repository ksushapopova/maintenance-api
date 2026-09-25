import Joi from 'joi';
import { idParam } from './common.js';

export const equipmentLoadSchema = {
  query: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso().min(Joi.ref('from')),
    minRequests: Joi.number().integer().min(0).max(1000).default(0),
  }),
};

export const siteIdParamSchema = {
  params: Joi.object({ id: idParam }),
};