import axios from "axios";
import { getRedis } from "./redis"; // ✅ Ensure this path is correct

export async function fetchCharts(coinName: string): Promise<any> {
  const cacheKey = `coinsChartData-${coinName}`;
  const redisClient = getRedis();

  try {
    // Try Redis cache
    let cachedData: string | null = null;
    try {
      cachedData = await redisClient.get(cacheKey);
    } catch (redisError) {
     
    }

    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (parseError) {
        console.error("❌ JSON parse error in cached data:", parseError);
        await redisClient.del(cacheKey);
      }
    }

    // Construct URL
    const url = `https://api.coingecko.com/api/v3/coins/${coinName}/market_chart`;

    // Fetch from CoinGecko
    const response = await axios.get(url, {
      params: {
        vs_currency: "usd",
        days: 10,
      },
      timeout: 10000,
    });

    if (response.status !== 200 || !response.data) {
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText}`
      );
    }

    const data = response.data;

    // Cache new data
    try {
      await redisClient.set(cacheKey, JSON.stringify(data));
      await redisClient.expire(cacheKey, 3600); // 1 hour TTL
      console.log("✅ Chart data cached in Redis");
    } catch (redisSetError) {
      console.error("❌ Redis SET/EXPIRE failed:", redisSetError);
    }

    return data;
  } catch (error: any) {
    console.error();

    throw new Error("Failed to fetch chart data. Please try again later.");
  }
}
