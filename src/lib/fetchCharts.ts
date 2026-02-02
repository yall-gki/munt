import axios from "axios";
import { getRedis } from "./redis";

export async function fetchCharts(coinName: string): Promise<any> {
  const cacheKey = `coinsChartData-${coinName}`;
  const redisClient = getRedis();
  const apiBase = "https://munt-api.onrender.com"; // your backend URL

  try {
    // Try Redis cache
    let cachedData: string | null = null;
    try {
      cachedData = await redisClient.get(cacheKey);
    } catch {}

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch {
        await redisClient.del(cacheKey);
      }
    }

    // Fetch from FastAPI backend
    const response = await axios.get(`${apiBase}/coins/${coinName}/market_chart`, {
      params: { days: 10 },
      timeout: 10000,
    });

    if (response.status !== 200 || !response.data) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const data = response.data;

    // Cache in Redis
    try {
      await redisClient.set(cacheKey, JSON.stringify(data));
      await redisClient.expire(cacheKey, 3600);
    } catch {}

    return data;
  } catch (error) {
    throw new Error("Failed to fetch chart data from backend.");
  }
}
