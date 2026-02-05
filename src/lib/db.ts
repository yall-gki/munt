import { PrismaClient } from "../../lib/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaPool?: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("DATABASE_URL is not set. Prisma will fail to connect.");
}

const pool =
  globalForPrisma.prismaPool ||
  new Pool({
    connectionString,
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: Number(process.env.PG_POOL_IDLE_MS ?? 30_000),
    connectionTimeoutMillis: Number(process.env.PG_POOL_TIMEOUT_MS ?? 10_000),
    keepAlive: true,
  });

const adapter = new PrismaPg(pool);

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaPool = pool;
}
