export class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    if (details) this.details = details;
  }
}