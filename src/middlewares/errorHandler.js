import { AppError } from '../errors/index.js';
import { config } from '../config/index.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    const body = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) body.error.details = err.details;
    if (req.id) body.error.requestId = req.id;

    return res.status(err.statusCode).json(body);
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Тело запроса не является корректным JSON',
        requestId: req.id,
      },
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Тело запроса слишком большое',
        requestId: req.id,
      },
    });
  }

  console.error(`[${req.id}] Unhandled error:`, err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        config.nodeEnv === 'production'
          ? 'Внутренняя ошибка сервера'
          : err.message,
      requestId: req.id,
    },
  });
}