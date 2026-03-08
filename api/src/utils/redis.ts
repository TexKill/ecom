import { createClient } from "redis";
import { env } from "../config/env";
import { logger } from "./logger";

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let initAttempted = false;

const buildRedisClient = () => {
  if (!env.REDIS_URL) {
    return null;
  }

  const client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 100, 3_000),
    },
  });

  client.on("error", (error) => {
    logger.warn("Redis client error", { error });
  });

  client.on("connect", () => {
    logger.info("Redis connected");
  });

  return client;
};

export const initRedisConnection = async () => {
  if (initAttempted) {
    return redisClient;
  }

  initAttempted = true;
  const client = buildRedisClient();
  if (!client) {
    logger.info("Redis disabled (REDIS_URL is not set)");
    return null;
  }

  try {
    await client.connect();
    redisClient = client;
    return redisClient;
  } catch (error) {
    logger.warn("Failed to connect to Redis; cache fallback to DB only", { error });
    redisClient = null;
    return null;
  }
};

export const getRedisClient = async () => {
  if (redisClient?.isReady) {
    return redisClient;
  }
  return initRedisConnection();
};
