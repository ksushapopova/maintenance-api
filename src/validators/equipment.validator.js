import Joi from 'joi';
import { idParam, paginationQuery } from './common.js';

const equipmentTypes = ['turbine', 'inverter', 'sensor', 'substation'];
const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'];

const locationSchema = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
}).required();

export const createEquipmentSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    type: Joi.string().valid(...equipmentTypes).required(),
    serialNumber: Joi.string().min(1).max(100).required(),
    location: locationSchema,
    status: Joi.string().valid(...equipmentStatuses).required(),
    installedAt: Joi.date().iso().less('now').required(),
  }),
};

export const updateEquipmentSchema = {
  params: Joi.object({ id: idParam }),
  body: Joi.object({
    name: Joi.string().min(3).max(100),
    type: Joi.string().valid(...equipmentTypes),
    serialNumber: Joi.string().min(1).max(100),
    location: locationSchema,
    status: Joi.string().valid(...equipmentStatuses),
    installedAt: Joi.date().iso().less('now'),
  }).min(1), 
};

export const listEquipmentSchema = {
  query: Joi.object({
    ...paginationQuery,
    status: Joi.string().valid(...equipmentStatuses),
    type: Joi.string().valid(...equipmentTypes),
    search: Joi.string().max(100),
  }),
};

export const idParamSchema = {
  params: Joi.object({ id: idParam }),
};