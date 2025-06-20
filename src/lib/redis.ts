import { Redis } from "@upstash/redis";
if (!process.env.REDIS_URL || !process.env.REDIS_SECRET) {
  throw new Error("Missing Redis environment variables!");
}
const redis = new Redis({
  url: "https://sunny-condor-50990.upstash.io",
  token: "AccuAAIjcDE0NTFlMTkzZDBjYWU0ZmEyODY1Yjc4ZGFmNzgyNGRhZnAxMA",
});


export default redis;
