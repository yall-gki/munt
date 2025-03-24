import axios from "axios";
import redisClient from "./redis";

export async function fetchCoins(ids: string[]): Promise<any> {
  if (!ids || ids.length === 0) {
    throw new Error("❌ No coin IDs provided.");
  }

  // 🔹 Sort IDs to ensure cache key consistency
  const sortedIds = [...ids].sort();
  const cacheKey = `coinsData:${sortedIds.join(",")}`;

  try {
    // 1️⃣ Try to get data from Redis cache
    let cachedData = await redisClient.get(cacheKey);
    if (
      cachedData 
    ) {
      try {
        console.log("✅ Data retrieved from Redis cache");
        return cachedData;
      } catch (parseError) {
        console.error("❌ JSON Parse Error:", parseError);
        await redisClient.del(cacheKey); // Clear corrupted cache
      }
    }else{  const batchSize = 20;
    let allCoins: any[] = [];

    for (let i = 0; i < sortedIds.length; i += batchSize) {
      const batch = sortedIds.slice(i, i + batchSize).join(",");

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

        if (response.status === 200) {
          allCoins.push(...response.data);
        } else {
          console.error("❌ CoinGecko API error:", response.statusText);
        }
      } catch (apiError) {
        console.error("❌ API Fetch Error:", apiError);
        // Don't throw an error here, just log it and continue with other batches
      }
    }

    if (allCoins.length === 0) {
      throw new Error("Failed to fetch any coin data.");
    }

    // 3️⃣ Cache the data in Redis for 1 hour
    await redisClient.set(cacheKey, JSON.stringify(allCoins));
    await redisClient.expire(cacheKey, 3600); // Set cache expiration

    return allCoins;
}

    // 2️⃣ Handle CoinGecko's API limit (split into batches of 20)
    } catch (error: any) {
    console.error("❌ Server Error:", error.message || error);
    throw new Error("Failed to fetch coin data. Please try again later.");
  }
}
