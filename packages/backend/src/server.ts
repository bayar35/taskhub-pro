import { app } from './app';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { env } from './config/env';
import { initSocket } from './config/socket';
import http from 'http';

const server = http.createServer(app);

// Socket.io
initSocket(server);

// Database
connectDB();

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`📴 ${signal} дохио ирлээ. Сервер унтрааж байна...`);

  server.close(async () => {
    logger.info('✅ HTTP server хаагдлаа');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('❌ Албадан унтраалаа');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server ${PORT} port дээр ажиллаж байна`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
  logger.info(`📡 API: ${env.API_URL}/api/v1`);
  logger.info(`🏥 Health: ${env.API_URL}/health`);
});