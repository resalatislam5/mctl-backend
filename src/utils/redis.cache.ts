// import redisClient from '../config/redis.config';

// export const getCache = async (key: string) => {
//   if (!redisClient.isOpen) return null;

//   const data = await redisClient.get(key);

//   if (!data) return null;

//   return JSON.parse(data);
// };

// export const setCache = async (key: string, value: unknown, ttl = 60) => {
//   if (!redisClient.isOpen) return null;
//   await redisClient.set(key, JSON.stringify(value), {
//     EX: ttl,
//   });
// };

// export const deleteCache = async (key: string) => {
//   if (!redisClient.isOpen) return null;
//   await redisClient.del(key);
// };

import redisClient from '../config/redis.config';

export const getCache = async <T = any>(key: string): Promise<T | null> => {
  try {
    const data = await redisClient.get(key);
    if (typeof data === 'string') {
      return JSON.parse(data) as T;
    }

    return null;
  } catch (err) {
    console.warn('⚠️ Redis GET failed, fallback DB', err);
    return null;
  }
};

export const setCache = async (key: string, value: unknown, ttl = 60) => {
  try {
    await redisClient.set(key, JSON.stringify(value), { ex: ttl }); // stringify object
  } catch (err) {
    console.warn('⚠️ Redis SET failed, ignoring', err);
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    console.warn('⚠️ Redis DEL failed, ignoring', err);
  }
};
