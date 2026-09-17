import 'dotenv/config';

function env(name, fallback) {
  const value = process.env[name];
  return value === undefined || value === '' ? fallback : value;
}

export const config = {
  port: Number(env('PORT', '3000')),
  nodeEnv: env('NODE_ENV', 'development'),

  corsOrigins: env('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  rateLimitWindowMs: Number(env('RATE_LIMIT_WINDOW_MS', '60000')),
  rateLimitMax: Number(env('RATE_LIMIT_MAX', '100')),

  bodyLimit: env('BODY_LIMIT', '100kb'),

  logLevel: env('LOG_LEVEL', 'info'),

  weatherApiUrl: env('WEATHER_API_URL', 'https://api.open-meteo.com/v1/forecast'),
  geocodingApiUrl: env('GEOCODING_API_URL', 'https://geocoding-api.open-meteo.com/v1/search'),
  requestTimeoutMs: Number(env('REQUEST_TIMEOUT_MS', '5000')),
};