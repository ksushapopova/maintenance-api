import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { validate } from '../middlewares/validate.js';
import { siteIdParamSchema } from '../validators/reports.validator.js';

export const sitesRouter = Router();

sitesRouter.get('/:id/summary', validate(siteIdParamSchema), reportsController.siteSummary);