import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      'Хэт олон хүсэлт илгээлээ. 15 минутын дараа дахин оролдоно уу.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message:
      'Хэт олон нэвтрэх оролдлого. 15 минутын дараа дахин оролдоно уу.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Хэт олон мессеж илгээлээ. Түр хүлээнэ үү.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});