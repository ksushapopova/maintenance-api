import { ConflictError, NotFoundError } from '../errors/index.js';

export async function withSequelizeErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      const field = err.errors?.[0]?.path ?? 'поле';
      throw new ConflictError(`Нарушено ограничение уникальности: ${field}`);
    }
    if (err.name === 'SequelizeForeignKeyConstraintError') {
      throw new NotFoundError('Связанная сущность не найдена');
    }
    throw err;
  }
}