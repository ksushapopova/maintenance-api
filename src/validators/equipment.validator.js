import Joi from 'joi';
import { idParam, paginationQuery } from './common.js';

const equipmentTypes = ['turbine', 'inverter', 'sensor', 'substation'];
const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'];

const locationShape = Joi.object({
  lat: Joi.number().min(-90).max(90).required(),
  lon: Joi.number().min(-180).max(180).required(),
});

const name = Joi.string().min(3).max(100);
const type = Joi.string().valid(...equipmentTypes);
const serialNumber = Joi.string().min(1).max(100);
const status = Joi.string().valid(...equipmentStatuses);
const installedAt = Joi.date().iso().less('now');

export const createEquipmentSchema = {
  body: Joi.object({
    name: name.required(),
    type: type.required(),
    serialNumber: serialNumber.required(),
    siteId: Joi.string().uuid(),
    location: locationShape,
    status: status.required(),
    installedAt: installedAt.required(),
  })
    .or('siteId', 'location')
    .messages({
      'object.missing': 'Нужно передать либо siteId, либо location',
    }),
};

export const updateEquipmentSchema = {
  params: Joi.object({ id: idParam }),
  body: Joi.object({
    name,
    type,
    serialNumber,
    siteId: Joi.string().uuid(),
    location: locationShape,
    status,
    installedAt,
  }).min(1),
};

export const listEquipmentSchema = {
  query: Joi.object({
    ...paginationQuery,
    status,
    type,
    search: Joi.string().max(100),
    siteId: Joi.string().uuid(),
  }),
};

export const idParamSchema = {
  params: Joi.object({ id: idParam }),
};