import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message = 'Некорректные данные запроса', details = []) {
    super(message, 422, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}