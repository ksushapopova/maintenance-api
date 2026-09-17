import { randomUUID } from 'node:crypto';

export function requestId(req, res, next) {
  const fromHeader = req.get('X-Request-Id');
  req.id = fromHeader && fromHeader.length <= 64 ? fromHeader : randomUUID().slice(0, 8);
  res.setHeader('X-Request-Id', req.id);
  next();
}