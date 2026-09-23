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
  apiKey: env('API_KEY', 'dev-secret-key'),
  db: {
    host: env('DB_HOST', 'localhost'),
    port: Number(env('DB_PORT', '5432')),
    name: env('DB_NAME', 'maintenance'),
    user: env('DB_USER', 'maintenance'),
    password: env('DB_PASSWORD', 'maintenance'),
    logging: env('DB_LOGGING', 'false') === 'true',
    pool: {
      max: Number(env('DB_POOL_MAX', '10')),
      min: Number(env('DB_POOL_MIN', '0')),
      acquire: Number(env('DB_POOL_ACQUIRE', '30000')),
      idle: Number(env('DB_POOL_IDLE', '10000')),
    },
  },
};