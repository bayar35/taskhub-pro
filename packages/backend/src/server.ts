import './instrument';
import http from 'http';
import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectDB } from './config/db';
import { initSocket } from './config/socket';

// ⬇️ cookieParser, authRoutes, app.use-ууд БҮГД app.ts руу шилжсэн
// Тиймээс энд дахин бичих шаардлагагүй!

async function bootstrap() {
  try {
    await connectDB();
    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.PORT, () => {
      logger.info(`🚀 Server ${env.PORT} port дээр ажиллаж байна`);
      logger.info(`🌍 Environment: ${env.NODE_ENV}`);
      logger.info(`📡 API: http://localhost:${env.PORT}/api/v1`);
      logger.info(`🏥 Health: http://localhost:${env.PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`${signal} дохио хүлээн авлаа. Серверийг хааж байна...`);
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

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

bootstrap();