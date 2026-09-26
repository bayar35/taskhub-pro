import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';

beforeAll(async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI тохируулаагүй байна. .env.test файлыг шалга.');
  }

  await mongoose.connect(uri);
  console.log('✅ Test MongoDB (Atlas) холбогдлоо');
}, 60000);

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
  }
  console.log('🔌 Test MongoDB салсан');
});