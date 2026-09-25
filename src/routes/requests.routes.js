import { Router } from 'express';
import { requestsController } from '../controllers/requests.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createRequestSchema,
  updateRequestSchema,
  changeStatusSchema,
  listRequestSchema,
  idParamSchema,
  assignTeamSchema,
  assigneeParamsSchema,
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
requestsRouter.get('/:id/assignees', validate(idParamSchema), requestsController.listAssignees);
requestsRouter.post('/:id/assignees', validate(assignTeamSchema), requestsController.assignTeam);
requestsRouter.delete('/:id/assignees/:userId', validate(assigneeParamsSchema), requestsController.removeAssignee);
requestsRouter.get('/:id/history', validate(idParamSchema), requestsController.listHistory);