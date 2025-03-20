import axios from "axios";
import redisClient from "./redis";

export async function fetchCoins(ids: string): Promise<any> {
  const cacheKey = `coinsData`;

  try {
    // Try to get data from Redis cache
    let cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      try {
        console.log("✅ Data retrieved from Redis cache");
        return JSON.parse(cachedData); // Safe JSON parsing
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        await redisClient.del(cacheKey); // Clear corrupted cache
      }
    }

    // Fetch data from the API if not in cache
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&locale=en&precision=2`
    );

    if (response.status !== 200) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    // Cache the data in Redis
    const data = response.data;
    await redisClient.set(cacheKey, JSON.stringify(data));
    await redisClient.expire(cacheKey, 3600); // Cache expiration after 1 hour

    return data;
  } catch (error: any) {
    console.error("❌ API Error:", error.message || error);
    throw new Error("Failed to fetch coin data. Please try again later.");
  }
}
