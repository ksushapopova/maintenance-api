require('dotenv/config');

const base = {
  username: process.env.DB_USER || 'maintenance',
  password: process.env.DB_PASSWORD || 'maintenance',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  dialect: 'postgres',
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};

module.exports = {
  development: {
    ...base,
    database: process.env.DB_NAME || 'maintenance',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  },
  test: {
    ...base,
    database: (process.env.DB_NAME || 'maintenance') + '_test',
    logging: false,
  },
  production: {
    ...base,
    database: process.env.DB_NAME,
    logging: false,
  },
};
