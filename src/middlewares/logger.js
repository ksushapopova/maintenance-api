import { config } from '../config/index.js';

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = LEVELS[config.logLevel] ?? LEVELS.info;

export function log(level, message, meta) {
  if (LEVELS[level] > currentLevel) return;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    console[level === 'error' ? 'error' : 'log'](line, meta);
  } else {
    console[level === 'error' ? 'error' : 'log'](line);
  }
}

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    log(level, `${req.method} ${req.originalUrl} ${res.statusCode}`, {
      requestId: req.id,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
}