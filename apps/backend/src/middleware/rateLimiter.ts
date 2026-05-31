import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '@/utils/redis';

interface LimiterOptions {
  windowMs: number;
  limit: number;
  message: string;
}

/**
 * Creates a rate limiting middleware.
 * Uses Redis via `rate-limit-redis` if available, otherwise falls back to local in-memory store.
 */
export const createRateLimiter = (options: LimiterOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7', // combined RateLimit headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
      message: options.message,
    },
    // If redis is connected, use rate-limit-redis Store. Otherwise, undefined triggers the built-in memory store.
    store: redis
      ? new RedisStore({
          // @ts-expect-error - redis.call is untyped or has slightly different signature on standard ioredis client
          sendCommand: (...args: string[]) => redis.call(args[0], ...args.slice(1)),
        })
      : undefined,
  });
};

// --- Preset Rate Limiting Policies ---

/**
 * Global limiter applied to all general API v1 routes.
 * 200 requests per 15 minutes.
 */
export const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: 'Too many requests. Please try again after 15 minutes.',
});

/**
 * Strict limiter applied to AI generation endpoints (e.g. question and contest generators).
 * 10 requests per 15 minutes.
 */
export const aiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: 'AI generation limit reached. Please try again after 15 minutes.',
});

/**
 * Moderate limiter applied to code executions/submissions to protect our runners.
 * 1 request per 10 seconds.
 */
export const submissionLimiter = createRateLimiter({
  windowMs: 10 * 1000,
  limit: 1,
  message: 'Too many code submissions. Please try again after 10 seconds.',
});
