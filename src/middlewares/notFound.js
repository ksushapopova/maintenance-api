import { NotFoundError } from '../errors/index.js';

export function notFound(req, res, next) {
  next(new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`));
}