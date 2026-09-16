import express from 'express';
import { router } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '100kb' }));

  app.use('/api', router);

  return app;
}