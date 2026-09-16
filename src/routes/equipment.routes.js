import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller.js';
import { requestsController } from '../controllers/requests.controller.js';

export const equipmentRouter = Router();

equipmentRouter.get('/', equipmentController.list);
equipmentRouter.post('/', equipmentController.create);
equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.patch('/:id', equipmentController.update);
equipmentRouter.delete('/:id', equipmentController.delete);

equipmentRouter.get('/:id/requests', requestsController.listByEquipment);