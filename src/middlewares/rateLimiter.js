import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

export const apiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: 'Слишком много запросов. Попробуйте позже.',
        requestId: req.id,
      },
    });
  },
});