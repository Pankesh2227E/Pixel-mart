import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return true;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables. Database features will be unavailable until configured.');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', error);
    return false;
  }
}

export function getIsConnected() {
  return isConnected || mongoose.connection.readyState === 1;
}
