import axios from "axios";
import redisClient from "./redis";

export async function fetchCharts(coinName: string): Promise<any> {
  const cacheKey = `coinsChartData-${coinName}`;

  try {
    // Check Redis cache
    let cachedData = await redisClient.get(cacheKey);

    if (
      cachedData 
    ) {
      try {
        console.log("✅ Data from Redis cache");
        return cachedData// Ensure parsing only if it's a valid JSON string
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        await redisClient.del(cacheKey); // Delete corrupted cache
      }
    }else{
      // Fetch from API if no valid cache
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${coinName}/market_chart?vs_currency=usd&days=10`
      );

      if (response.status !== 200) {
        throw new Error(`CoinGecko API error: ${response.statusText}`);
      }

      const data = response.data;

      // Ensure JSON data is correctly stored in Redis
      if (data) {
        await redisClient.set(cacheKey, JSON.stringify(data));
        await redisClient.expire(cacheKey, 3600); // Set cache expiry
      }

      return data;
    }


  } catch (error: any) {
    console.error("❌ API Error:", error.message || error);
    throw new Error("Failed to fetch chart data. Please try again later.");
  }
}
