import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { router } from './routes/index.js';
import { config } from './config/index.js';
import { requestId } from './middlewares/requestId.js';
import { requestLogger } from './middlewares/logger.js';
import { apiRateLimiter } from './middlewares/rateLimiter.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (config.corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} не разрешён`));
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      credentials: true,
    })
  );

  app.use(requestId);

  app.use(requestLogger);

  app.use(express.json({ limit: config.bodyLimit }));

  app.use('/api', apiRateLimiter);

  app.use('/api', router);

  app.use(notFound);

  app.use(errorHandler);

  return app;
}