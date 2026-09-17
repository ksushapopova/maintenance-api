import Joi from 'joi';

export const idParam = Joi.string().uuid().required();

export const paginationQuery = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().max(40).optional(),
  order: Joi.string().valid('asc', 'desc').default('asc'),
};