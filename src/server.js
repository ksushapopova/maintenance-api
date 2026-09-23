import { createApp } from './app.js';
import { config } from './config/index.js';
import { connectDb, closeDb } from './db/index.js';

async function start() {
  try {
    await connectDb();
    console.log('DB connected');
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`Server started on http://localhost:${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received, shutting down...`);
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});