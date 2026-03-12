import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis.config';
import { deleteCache, getCache, setCache } from '../utils/redis.cache';

export const cacheMiddleware = (ttl = 86400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    console.log('key--->', key);

    const cached = await await getCache(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      // redisClient.set(key, JSON.stringify(body), {
      //   EX: ttl,
      // });
      setCache(key, body, ttl).catch(() => {});
      return originalJson(body);
    };

    next();
  };
};

/**
 * Invalidate cache middleware
 * Automatically generates key like cacheMiddleware
 * @param getKey Optional custom key generator function
 */
export const cacheInvalidateMiddleware = (
  getKey?: (req: Request) => string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Auto-generate key if no custom generator is provided
      let key: string;
      if (getKey) {
        key = getKey(req);
      } else {
        // Default: use originalUrl as key
        key = req.originalUrl;
      }

      await deleteCache(key);
      console.log(`Cache invalidated for key: ${key}`);

      next();
    } catch (err) {
      console.error('Cache invalidation error:', err);
      next(); // continue even if delete fails
    }
  };
};
