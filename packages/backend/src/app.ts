import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
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
import paymentRoutes from './modules/payment/payment.routes';
import { logger } from './config/logger';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';

export const app = express();

// ============================================================================
// Security Middleware
// ============================================================================
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);

if (env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}

// ============================================================================
// Body Parsers
// ============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================================================
// Sanitization (skip in test)
// ============================================================================
if (env.NODE_ENV !== 'test') {
  app.use(mongoSanitizeMiddleware);
  app.use(xssMiddleware);
  app.use(hppMiddleware);
}

// ============================================================================
// Logging
// ============================================================================
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else if (env.NODE_ENV === 'production') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ============================================================================
// Swagger API Docs (skip in production)
// ============================================================================
if (env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ============================================================================
// Health Check
// ============================================================================
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
  });
});

// ============================================================================
// API Routes
// ============================================================================
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/payments', paymentRoutes);

// ============================================================================
// Error Handling
// ============================================================================
app.use(notFoundMiddleware);
app.use(errorMiddleware);