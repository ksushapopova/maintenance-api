import { config } from '../config/index.js';

export function requireApiKey(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const provided = req.get('X-API-Key');
  if (!provided || provided !== config.apiKey) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Требуется корректный заголовок X-API-Key',
        requestId: req.id,
      },
    });
  }

  next();
}