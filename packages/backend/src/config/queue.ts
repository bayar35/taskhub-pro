import { Queue, Worker } from 'bullmq';
import { redis } from './redis';
import { logger } from './logger';

// Redis байхгүй бол queue үүсгэхгүй
const connection = redis
  ? {
      host: redis.options.host || 'localhost',
      port: redis.options.port || 6379,
      password: redis.options.password,
    }
  : null;

export const emailQueue = connection
  ? new Queue('email', { connection })
  : null;

export const contentQueue = connection
  ? new Queue('content', { connection })
  : null;

export const notificationQueue = connection
  ? new Queue('notification', { connection })
  : null;

// Workers (зөвхөн Redis байгаа үед)
if (connection) {
  new Worker(
    'email',
    async (job) => {
      const { to } = job.data;
      logger.info(`Email job: ${to}`);
    },
    { connection }
  );

  new Worker(
    'content',
    async (job) => {
      const { organizationId, type } = job.data;
      logger.info(`Content job: ${organizationId} - ${type}`);
    },
    { connection }
  );
}

// Add job helper
export async function addEmailJob(data: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!emailQueue) {
    logger.warn('Email queue унтраалттай (Redis байхгүй)');
    return null;
  }
  return emailQueue.add('send', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}