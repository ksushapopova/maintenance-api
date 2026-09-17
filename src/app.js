import express from 'express';
import { router } from './routes/index.js';
import { requestId } from './middlewares/requestId.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(requestId);
  
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', router);

  app.use(notFound);

  app.use(errorHandler);

  return app;
}