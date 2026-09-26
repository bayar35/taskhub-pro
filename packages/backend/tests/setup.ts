import { beforeAll, afterAll, afterEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

beforeAll(async () => {
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('⚠️ MONGO_URI байхгүй — MongoMemoryServer ашиглаж байна');
    mongoServer = await MongoMemoryServer.create({
      binary: { version: '7.0.14' },
      instance: { launchTimeout: 120000 },
    });
    uri = mongoServer.getUri();
  } else {
    console.log('✅ MongoDB Atlas ашиглаж байна');
  }

  await mongoose.connect(uri);
  console.log('✅ Test MongoDB холбогдлоо');
}, 300000);

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
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('🔌 Test MongoDB салсан');
});