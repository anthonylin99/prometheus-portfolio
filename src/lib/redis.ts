import { Redis } from '@upstash/redis';

// Create Redis client - will throw if env vars not set
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.warn('Upstash Redis not configured. Using in-memory fallback.');
    return null;
  }
  
  return new Redis({
    url,
    token,
  });
}

export const redis = createRedisClient();

// Check if Redis is available
export const isRedisAvailable = (): boolean => redis !== null;

// Get Redis client or throw (used by auth and multi-user features that require Redis)
export function getRequiredRedis(): Redis {
  if (!redis) {
    throw new Error(
      'Redis is required for authentication. Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.local'
    );
  }
  return redis;
}

// Get Redis client or null (for optional features like default circle lookup)
export function getOptionalRedis(): Redis | null {
  return redis;
}
