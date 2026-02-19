import mongoose from 'mongoose';

/**
 * Connect to the MongoDB database using Mongoose
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL!, {
      dbName: 'mtcl',
      autoIndex: false,
      appName: 'mtcl',
    });
    console.log('Database connected');
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

export default connectDB;
