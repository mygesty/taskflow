import { createClient, type RedisClientType } from "redis";
import { logger } from "./logger";

let redisClient: RedisClientType | null = null;

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = createClient({ url });

    redisClient.on("error", (err) => {
      logger.error({ err }, "Redis client error");
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connected");
    });
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = getRedisClient();
  if (!client.isOpen) {
    await client.connect();
  }
}

export async function pingRedis(): Promise<boolean> {
  try {
    const client = getRedisClient();
    if (!client.isOpen) {
      await client.connect();
    }
    const result = await client.ping();
    return result === "PONG";
  } catch {
    return false;
  }
}
