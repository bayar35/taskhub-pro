import { z } from 'zod';
import dotenv from 'dotenv';

// Тест орчинд .env.test, бусад үед .env
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI шаардлагатай'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET шаардлагатай'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET шаардлагатай'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  API_URL: z.string().default('http://localhost:5000'),

  // Security
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // SMTP (optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // AWS S3 (optional)
  AWS_REGION: z.string().default('ap-southeast-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // OpenAI (optional)
  OPENAI_API_KEY: z.string().optional(),
  PINECONE_API_KEY: z.string().optional(),

  // Redis (optional)
  REDIS_URL: z.string().default(''),

  // QPay (optional)
  QPAY_BASE_URL: z.string().default('https://merchant.qpay.mn/v2'),
  QPAY_CLIENT_ID: z.string().optional(),
  QPAY_CLIENT_SECRET: z.string().optional(),
  QPAY_INVOICE_CODE: z.string().optional(),

  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Sentry (optional)
  SENTRY_DSN: z.string().optional(),
});

// ⬇️ Алдаа гарвал process.exit хийхгүй, зөвхөн лог хийх
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment variables алдаа:');
  console.error(parsed.error.flatten().fieldErrors);
}

// Fallback утгууд
export const env = parsed.success
  ? parsed.data
  : {
      NODE_ENV: (process.env.NODE_ENV as any) || 'production',
      PORT: parseInt(process.env.PORT || '5000'),
      MONGO_URI: process.env.MONGO_URI || '',
      JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret',
      JWT_REFRESH_SECRET:
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
      API_URL: process.env.API_URL || 'http://localhost:5000',
      RATE_LIMIT_WINDOW_MS: 900000,
      RATE_LIMIT_MAX: 100,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PINECONE_API_KEY: process.env.PINECONE_API_KEY,
      REDIS_URL: process.env.REDIS_URL || '',
      QPAY_BASE_URL:
        process.env.QPAY_BASE_URL || 'https://merchant.qpay.mn/v2',
      QPAY_CLIENT_ID: process.env.QPAY_CLIENT_ID,
      QPAY_CLIENT_SECRET: process.env.QPAY_CLIENT_SECRET,
      QPAY_INVOICE_CODE: process.env.QPAY_INVOICE_CODE,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      SENTRY_DSN: process.env.SENTRY_DSN,
    } as any;