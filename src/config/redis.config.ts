import { createClient, RedisClientType } from 'redis';
import { ENV } from './env.config';

const redisClient: RedisClientType = createClient({
  socket: {
    host: ENV.REDIS_HOST || '127.0.0.1',
    port: Number(ENV.REDIS_PORT) || 6379,
  },
  //   password: ENV.REDIS_PASSWORD as string,
  password: ENV.REDIS_PASSWORD as string,
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

let redisReady = false; // <-- important

export const connectRedis = async () => {
  if (!redisReady) {
    try {
      //   await redisClient.connect();
      redisReady = true;
      console.log('✅ Redis connected');
    } catch (err) {
      console.error('❌ Redis connect failed:', err);
      throw err;
    }
  } else {
    console.log('Redis already connected');
  }
};

export default redisClient;
