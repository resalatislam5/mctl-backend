import redisClient from '../config/redis.config';

export const getCache = async (key: string) => {
  if (!redisClient.isOpen) return null;

  const data = await redisClient.get(key);

  if (!data) return null;

  return JSON.parse(data);
};

export const setCache = async (key: string, value: unknown, ttl = 60) => {
  if (!redisClient.isOpen) return null;
  await redisClient.set(key, JSON.stringify(value), {
    EX: ttl,
  });
};

export const deleteCache = async (key: string) => {
  if (!redisClient.isOpen) return null;
  await redisClient.del(key);
};
