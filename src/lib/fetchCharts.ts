import axios from "axios";
import redisClient from "./redis"; // make sure this path is correct

export async function fetchCharts(coinName: string): Promise<any> {
  const cacheKey = `coinsChartData-${coinName}`;

  try {
    // Try fetching from Redis cache
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      try {
        console.log("✅ Chart data from Redis cache");
        if (typeof cachedData === "string") {
          return JSON.parse(cachedData); // ✅ Parse before returning
        } else {
          console.error("❌ Cached data is not a string, clearing cache.");
          await redisClient.del(cacheKey);
        }
      } catch (parseError) {
        console.error("❌ JSON parse error, clearing cache:", parseError);
        await redisClient.del(cacheKey); // Clear corrupted cache
      }
    }

    // If no cache or cache failed, fetch from CoinGecko API
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${coinName}/market_chart`,
      {
        params: {
          vs_currency: "usd",
          days: 10,
        },
        timeout: 10000,
      }
    );

    if (response.status !== 200 || !response.data) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = response.data;

    // Cache the new data in Redis
    await redisClient.set(cacheKey, JSON.stringify(data));
    await redisClient.expire(cacheKey, 3600); // Cache for 1 hour

    console.log("✅ Fresh chart data fetched and cached");
    return data;
  } catch (error: any) {
    console.error("❌ fetchCharts error:", error.message || error);
    throw new Error("Failed to fetch chart data. Please try again later.");
  }
}
