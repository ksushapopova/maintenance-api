import { Router } from 'express';
import { requestsController } from '../controllers/requests.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createRequestSchema,
  updateRequestSchema,
  changeStatusSchema,
  listRequestSchema,
  idParamSchema,
} from '../validators/request.validator.js';

export const requestsRouter = Router();

requestsRouter.get('/', validate(listRequestSchema), requestsController.list);
requestsRouter.post('/', validate(createRequestSchema), requestsController.create);
requestsRouter.get('/:id', validate(idParamSchema), requestsController.getById);
requestsRouter.patch('/:id', validate(updateRequestSchema), requestsController.update);
requestsRouter.patch(
  '/:id/status',
  validate(changeStatusSchema),
  requestsController.changeStatus
);
requestsRouter.delete('/:id', validate(idParamSchema), requestsController.delete);