import { Router } from 'express';
import { equipmentRouter } from './equipment.routes.js';
import { requestsRouter } from './requests.routes.js';

export const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/equipment', equipmentRouter);
router.use('/requests', requestsRouter);