import mongoose from 'mongoose';
import { env } from './env';
import { logger } from './logger';

export async function connectDB() {
  try {
    if (!env.MONGO_URI) {
      throw new Error('MONGO_URI тохируулаагүй байна');
    }

    await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    logger.info('✅ MongoDB холбогдлоо');
  } catch (error: any) {
    logger.error(`❌ MongoDB холболтын алдаа: ${error.message}`);
    throw error;
  }
}