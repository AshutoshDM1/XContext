import type { Request, Response, NextFunction } from 'express';
import { redis } from '@/utils/redis';

interface CacheOptions {
  ttl?: number; // Time-to-live in seconds (default: 300 / 5 minutes)
}

/**
 * Express middleware to cache GET responses in Redis.
 * If Redis is unavailable or fails, it gracefully proceeds to the next handler.
 */
export const cacheMiddleware = (
  key: string | ((req: Request) => string),
  options: CacheOptions = {},
) => {
  const ttl = options.ttl ?? 300;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redis) {
      return next();
    }

    const cacheKey = typeof key === 'function' ? key(req) : key;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cachedData));
      }

      // Intercept res.json to cache the output before sending
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        // Only cache successful JSON responses (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, JSON.stringify(body), 'EX', ttl).catch((err) => {
            console.error(`[Redis Cache] Error setting key "${cacheKey}":`, err);
          });
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error(`[Redis Cache] Middleware error for key "${cacheKey}":`, error);
      next();
    }
  };
};

/**
 * Invalidates specific cache keys.
 */
export const invalidateCache = async (keyOrKeys: string | string[]) => {
  if (!redis) return;
  try {
    const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    await redis.del(...keys);
    console.log(`[Redis Cache] Successfully invalidated keys: ${keys.join(', ')}`);
  } catch (error) {
    console.error(`[Redis Cache] Failed to invalidate cache keys ${keyOrKeys}:`, error);
  }
};

// Cache keys constants for consistency
export const CACHE_KEYS = {
  publicContests: 'contests:public',
  categories: 'categories:list',
};

export const getPrivateContestsKey = (userId: string) => `user:${userId}:contests`;

export const getSingleContestCacheKey = (req: Request) => {
  const contestId = req.params.id;
  const userId = (req as any).user?.id;
  return userId ? `user:${userId}:contest:${contestId}` : `contest:${contestId}:public`;
};

export const getSingleContestInvalidationKeys = (contestId: number | string, userId: string) => {
  return [`contest:${contestId}:public`, `user:${userId}:contest:${contestId}`];
};
