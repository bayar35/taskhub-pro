import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {
  helmetMiddleware,
  rateLimiter,
  corsMiddleware,
  mongoSanitizeMiddleware,
  xssMiddleware,
  hppMiddleware,
  compressionMiddleware,
} from './middleware/security.middleware';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/notFound.middleware';
import authRoutes from './modules/auth/auth.routes';
import todoRoutes from './modules/todo/todo.routes';
import notificationRoutes from './modules/notification/notification.routes';
import fileRoutes from './modules/file/file.routes';
import paymentRoutes from './modules/payment/payment.routes';  // ✅ НЭМЭХ
import { logger } from './config/logger';
import { env } from './config/env';

export const app = express();

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);

if (env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(mongoSanitizeMiddleware);
  app.use(xssMiddleware);
  app.use(hppMiddleware);
}

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (env.NODE_ENV === 'production') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/payments', paymentRoutes);  // ✅ НЭМЭХ

app.use(notFoundMiddleware);
app.use(errorMiddleware);