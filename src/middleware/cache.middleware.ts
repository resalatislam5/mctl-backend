import { Request, Response, NextFunction } from 'express';
import { deleteCache, getCache, setCache } from '../utils/redis.cache';

/**
 * Cache middleware
 * Caches GET responses in Redis
 * @param ttl Cache time-to-live in seconds (default 1 day)
 */
export const cacheMiddleware = (ttl = 86400) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.originalUrl;
    console.log('key ---->', key);

    try {
      const cached = await getCache(key);
      if (cached) {
        console.log('cache send');
        console.log('✅ Response served from cache:', key);
        return res.json(cached);
      }
    } catch (err) {
      console.warn('⚠️ Cache read failed, continuing to DB', err);
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      setCache(key, body, ttl).catch((err) => {
        console.warn('⚠️ Cache write failed', err);
      });
      return originalJson(body);
    };

    next();
  };
};

/**
 * Cache invalidation middleware
 * Automatically deletes cache for a key
 * @param getKey Optional custom key generator function
 */
export const cacheInvalidateMiddleware = (
  getKey?: (req: Request) => string,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = getKey ? getKey(req) : req.originalUrl;
      await deleteCache(key);
      console.log('🗑 Cache invalidated:', key);
    } catch (err) {
      console.warn('⚠️ Cache invalidation error', err);
    } finally {
      next(); // continue request regardless of cache errors
    }
  };
};
