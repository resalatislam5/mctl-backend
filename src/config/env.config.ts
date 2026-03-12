import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
  REDIS_URL: process.env.REDIS_URL,
};
