import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import compression from 'compression';
import cors from 'cors';
import { env } from '../config/env';

// 1. Helmet — HTTP headers хамгаалалт
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

// 2. Rate Limiting — API хамгаалалт
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

// 3. Auth Rate Limiting — Login/Register хамгаалалт
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

// 4. CORS — Domain хамгаалалт
export const corsMiddleware = cors({
  origin: env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// 5. NoSQL Injection — Express 5-д тохирсон
export const mongoSanitizeMiddleware = (
  req: any,
  _res: any,
  next: any
) => {
  // Тест орчинд унтраах
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    // Express 5-д req.query нь read-only getter
    // Тиймээс зөвхөн req.body болон req.params-ийг sanitize хийнэ
    if (req.body) {
      req.body = mongoSanitize.sanitize(req.body, {
        replaceWith: '_',
      });
    }

    if (req.params) {
      req.params = mongoSanitize.sanitize(req.params, {
        replaceWith: '_',
      });
    }

    // req.query-г sanitize хийхгүй (Express 5-д read-only)
    // Учир нь Zod validation нь query параметрүүдийг шалгадаг

    next();
  } catch (error: any) {
    console.error('❌ mongoSanitize алдаа:', error.message);
    next();
  }
};

// 6. XSS Protection — Express 5-д тохирсон
export const xssMiddleware = (req: any, res: any, next: any) => {
  // Тест орчинд унтраах
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    // xss-clean нь middleware тул (req, res, next) шаарддаг.
    // Мөн req.body, req.query, req.params-ийг өөрөө цэвэрлэдэг.
    return xss()(req, res, next);
  } catch (error: any) {
    console.error('❌ xss-clean алдаа:', error.message);
    next();
  }
};

// 7. HPP (HTTP Parameter Pollution) — Express 5-д тохирсон
export const hppMiddleware = (req: any, _res: any, next: any) => {
  // Тест орчинд унтраах
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    // Express 5-д req.query нь read-only
    // Тиймээс HPP-г зөвхөн req.body дээр ажиллуулна
    if (req.body && typeof req.body === 'object') {
      // HPP-ийн логик: давхардсан параметрүүдийг арилгах
      for (const key in req.body) {
        if (Array.isArray(req.body[key])) {
          req.body[key] = req.body[key][req.body[key].length - 1];
        }
      }
    }

    next();
  } catch (error: any) {
    console.error('❌ hpp алдаа:', error.message);
    next();
  }
};

// 8. Compression — Response хэмжээг багасгах
export const compressionMiddleware = compression();