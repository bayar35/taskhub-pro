import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';

async function bootstrap() {
  try {
    // 1. MongoDB холболт
    await connectDB();

    // 2. HTTP server
    const server = http.createServer(app);

    // 3. Socket.io
    initSocket(server);

    // 4. Listen
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server ${env.PORT} port дээр ажиллаж байна`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 API: http://localhost:${env.PORT}/api/v1`);
      logger.info(`🏥 Health: http://localhost:${env.PORT}/health`);
    });

    // 5. Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(
        `${signal} дохио хүлээн авлаа. Серверийг хааж байна...`
      );

      server.close(() => {
        logger.info('HTTP server хаагдлаа');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Албадсан хаалт. Forced exit.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Server эхлүүлэх алдаа: ${(err as Error).message}`);
    process.exit(1);
  }
}

// Global error handlers
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

bootstrap();