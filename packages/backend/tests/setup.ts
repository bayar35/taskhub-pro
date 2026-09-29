import mongoose from 'mongoose';
import dotenv from 'dotenv';

// .env.test файлыг уншина
dotenv.config({ path: '.env.test' });

let isConnected = false;

export async function connectTestDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI тохируулаагүй байна (.env.test)');
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log('✅ Test MongoDB (Atlas) холбогдлоо');
}

export async function disconnectTestDB() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    isConnected = false;
    console.log('🔌 Test MongoDB салсан');
  } catch (error) {
    console.error('MongoDB disconnect error:', error);
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    try {
      await collections[key].deleteMany({});
    } catch {
      // Collection хоосон бол алгасах
    }
  }
}