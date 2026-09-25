import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { validate } from '../middlewares/validate.js';
import { equipmentLoadSchema } from '../validators/reports.validator.js';

export const reportsRouter = Router();

reportsRouter.get('/equipment-load', validate(equipmentLoadSchema), reportsController.equipmentLoad);