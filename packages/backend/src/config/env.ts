import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1, 'MONGO_URI шаардлагатай'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET 32+ тэмдэгт'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET 32+ тэмдэгт'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  // ⬇️ SMTP тохиргоонууд - z.object ДОТОР байх ёстой
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // QPay
  QPAY_BASE_URL: z.string().default('https://merchant.qpay.mn/v2'),
  QPAY_CLIENT_ID: z.string().optional(),
  QPAY_CLIENT_SECRET: z.string().optional(),
  QPAY_INVOICE_CODE: z.string().optional(),
  
  // AWS S3
  AWS_REGION: z.string().default('ap-southeast-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  
  // Pinecone
  PINECONE_API_KEY: z.string().optional(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // API URL
  API_URL: z.string().default('http://localhost:5000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment variables алдаа:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;