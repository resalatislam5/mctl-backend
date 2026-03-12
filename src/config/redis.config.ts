import { createClient, RedisClientType } from 'redis';
import { ENV } from './env.config';

const redisClient: RedisClientType = createClient({
  url: ENV.REDIS_URL as string,
});

redisClient.on('error', (err) => {
  console.warn('⚠️ Redis error (ignored, fallback to DB):', err);
});

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Redis connected');
    } else {
      console.log('Redis already connected');
    }
  } catch (err) {
    console.warn('⚠️ Redis connection failed, continuing without cache', err);
    // Do NOT throw → serverless-safe
  }
};

export default redisClient;
