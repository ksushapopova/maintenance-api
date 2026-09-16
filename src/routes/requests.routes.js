import { Router } from 'express';
import { requestsController } from '../controllers/requests.controller.js';

export const requestsRouter = Router();

requestsRouter.get('/', requestsController.list);
requestsRouter.post('/', requestsController.create);
requestsRouter.get('/:id', requestsController.getById);
requestsRouter.patch('/:id', requestsController.update);
requestsRouter.patch('/:id/status', requestsController.changeStatus);
requestsRouter.delete('/:id', requestsController.delete);