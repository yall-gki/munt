// src/lib/redis.ts
import { Redis } from "@upstash/redis";

let redis: Redis | undefined;

if (process.env.REDIS_URL && process.env.REDIS_SECRET) {
  redis = new Redis({
    url: process.env.REDIS_URL,
    token: process.env.REDIS_SECRET,
  });
} else if (process.env.NODE_ENV !== "production") {
  console.warn("Redis env variables missing — skipping Redis initialization at build time");
}

// Export a function to get Redis client safely
export function getRedis(): Redis {
  if (!redis) {
    throw new Error("Redis is not initialized. Make sure REDIS_URL and REDIS_SECRET are set.");
  }
  return redis;
}
