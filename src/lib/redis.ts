import { Redis } from "@upstash/redis";
if (!process.env.REDIS_URL || !process.env.REDIS_SECRET) {
  throw new Error("Missing Redis environment variables!");
}
const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_SECRET!,
});


export default redis;
