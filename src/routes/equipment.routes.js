import { Router } from 'express';
import { equipmentController } from '../controllers/equipment.controller.js';
import { requestsController } from '../controllers/requests.controller.js';
import { validate } from '../middlewares/validate.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  listEquipmentSchema,
  idParamSchema,
} from '../validators/equipment.validator.js';

export const equipmentRouter = Router();

equipmentRouter.get('/', validate(listEquipmentSchema), equipmentController.list);
equipmentRouter.post('/', validate(createEquipmentSchema), equipmentController.create);
equipmentRouter.get('/:id', validate(idParamSchema), equipmentController.getById);
equipmentRouter.patch('/:id', validate(updateEquipmentSchema), equipmentController.update);
equipmentRouter.delete('/:id', validate(idParamSchema), equipmentController.delete);

equipmentRouter.get(
  '/:id/requests',
  validate(idParamSchema),
  requestsController.listByEquipment
);