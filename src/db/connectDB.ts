import mongoose from 'mongoose';

let cached = false;

const connectDB = async () => {
  if (cached) return;
  if (!process.env.DB_URL) throw new Error('DB_URL not defined');

  try {
    await mongoose.connect(process.env.DB_URL, {
      dbName: 'mctl',
      autoIndex: false,
      appName: 'mctl',
    });
    cached = true;
    console.log('✅ MongoDB connected');
  } catch (err: any) {
    console.error('MongoDB connection failed:', err.message);
    // DO NOT call process.exit() in serverless
    throw err; // Let handler catch the error
  }
};

export default connectDB;
