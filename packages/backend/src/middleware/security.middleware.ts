import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import { env } from '../config/env';

// 1. Helmet
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// 2. Rate Limiting
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Хэт олон хүсэлт илгээсэн. 15 минутын дараа дахин оролдоно уу.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// 3. Auth Rate Limiting
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу.',
  },
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === 'test',
});

// 4. CORS
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// 5. NoSQL Injection (тест орчинд унтраах)
export const mongoSanitizeMiddleware = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req: r, key }) => {
      console.warn(`⚠️ NoSQL Injection: ${key}`, {
        ip: r.ip,
        path: r.path,
      });
    },
  })(req, res, next);
};

// 6. XSS Protection
export const xssMiddleware = xss();

// 7. HPP
export const hppMiddleware = hpp();

// 8. Compression
export const compressionMiddleware = compression();