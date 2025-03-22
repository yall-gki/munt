import axios from "axios";
import redisClient from "./redis";

export async function fetchCoins(ids: string[]): Promise<any> {
  if (!ids || ids.length === 0) {
    throw new Error("❌ No coin IDs provided.");
  }

  const cacheKey = `coinsData:${ids.join(",")}`; // Cache each unique request separately

  try {
    // 1️⃣ Try to get data from Redis cache
    let cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      try {
        console.log("✅ Data retrieved from Redis cache");
        return JSON.parse(cachedData);
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        await redisClient.del(cacheKey); // Clear corrupted cache
      }
    }

    // 2️⃣ Handle CoinGecko's API limit (split into batches of 20)
    const batchSize = 20;
    let allCoins: any[] = [];

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize).join(",");
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/markets`,
          {
            params: {
              vs_currency: "usd",
              ids: batch,
              order: "market_cap_desc",
              per_page: batchSize,
              page: 1,
              sparkline: false,
              locale: "en",
              precision: 2,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(`CoinGecko API error: ${response.statusText}`);
        }

        allCoins.push(...response.data);
      } catch (apiError) {
        console.error("❌ API Fetch Error:", apiError);
        throw new Error("Failed to fetch coin data.");
      }
    }

    // 3️⃣ Cache the data in Redis for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(allCoins));
    await redisClient.expire(cacheKey, 3600); // Set cache expiration

    return allCoins;
  } catch (error: any) {
    console.error("❌ Server Error:", error.message || error);
    throw new Error("Failed to fetch coin data. Please try again later.");
  }
}
