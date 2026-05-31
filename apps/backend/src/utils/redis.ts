import { Redis } from 'ioredis'; // Or @upstash/redis depending on provider

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn(
    '⚠️ REDIS_URL environment variable is missing. Caching and rate limiting will be disabled.',
  );
}

export const redis = new Redis(redisUrl!);
