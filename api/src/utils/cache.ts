import { env } from "../config/env";
import { logger } from "./logger";
import { getRedisClient } from "./redis";

export const buildCacheKey = (...parts: string[]) =>
  [env.REDIS_KEY_PREFIX, ...parts].join(":");

export const getCachedJson = async <T>(key: string): Promise<T | null> => {
  const client = await getRedisClient();
  if (!client) return null;

  try {
    const cached = await client.get(key);
    if (!cached) return null;
    return JSON.parse(cached) as T;
  } catch (error) {
    logger.warn("Cache read failed", { key, error });
    return null;
  }
};

export const setCachedJson = async <T>(
  key: string,
  value: T,
  ttlSeconds = env.CACHE_TTL_SECONDS,
) => {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (error) {
    logger.warn("Cache write failed", { key, error });
  }
};

export const deleteCacheKey = async (key: string) => {
  const client = await getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (error) {
    logger.warn("Cache key deletion failed", { key, error });
  }
};

export const deleteCacheByPattern = async (pattern: string) => {
  const client = await getRedisClient();
  if (!client) return 0;

  try {
    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;
    return client.del(keys);
  } catch (error) {
    logger.warn("Cache pattern deletion failed", { pattern, error });
    return 0;
  }
};
