import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

const REDIS_ENABLED = env.REDIS_URL && env.REDIS_URL !== 'redis://localhost:6379';

let redis: Redis | null = null;

if (REDIS_ENABLED) {
  redis = new Redis(env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) {
        logger.warn('Redis холбогдсонгүй, cache унтраалаа');
        return null; // Retry зогсоох
      }
      return Math.min(times * 50, 2000);
    },
    lazyConnect: true,
  });

  redis.on('connect', () => logger.info('✅ Redis холбогдлоо'));
  redis.on('error', (err) => logger.warn('Redis алдаа:', err.message));
} else {
  logger.info('⚠️ Redis унтраалттай (REDIS_URL тохируулаагүй)');
}

export { redis };

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: any,
  ttlSeconds = 300
): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache алдаа гарвал алгасах
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // Cache алдаа гарвал алгасах
  }
}