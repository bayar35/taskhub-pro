import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB холбогдлоо');

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB алдаа: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB салсан');
    });
  } catch (err) {
    logger.error(
      `MongoDB холболтын алдаа: ${(err as Error).message}`
    );
    process.exit(1);
  }
}