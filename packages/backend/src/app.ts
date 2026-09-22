import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimiter.middleware';
import {
  notFound,
  errorHandler,
} from './middleware/error.middleware';

import authRoutes from './modules/auth/auth.routes';
import todoRoutes from './modules/todo/todo.routes';

const app: Application = express();

// 🔒 Security
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// 📦 Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ⚡ Performance
app.use(compression());

// 📝 Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// 🛡️ Rate limiting
app.use('/api', apiLimiter);

// 🏥 Health check — ЗӨВ БАЙРЛАЛД
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
  });
});

// 🚏 Routes — ЗӨВХӨН 1 УДАА бүртгэх
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/todos', todoRoutes);

// ❌ Error handlers (хамгийн сүүлд)
app.use(notFound);
app.use(errorHandler);

export default app;