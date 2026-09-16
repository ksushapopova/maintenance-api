import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller.js';

export const equipmentRouter = Router();

equipmentRouter.get('/', equipmentController.list);
equipmentRouter.post('/', equipmentController.create);
equipmentRouter.get('/:id', equipmentController.getById);
equipmentRouter.patch('/:id', equipmentController.update);
equipmentRouter.delete('/:id', equipmentController.delete);