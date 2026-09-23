import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// .env.test файлаас унших
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

beforeAll(async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in .env.test');

  await mongoose.connect(uri);
  console.log('✅ Test MongoDB холбогдлоо');
}, 30000);

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('🔌 Test MongoDB салсан');
  }
});