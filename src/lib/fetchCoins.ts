import axios from "axios";
import {getRedis} from "./redis"; // ✅ Ensure correct path

export async function fetchCoins(ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) {
    throw new Error("❌ No coin IDs provided.");
  }

  const sortedIds = [...ids].sort();
  const cacheKey = `coinsData-${sortedIds.join(",")}`;
  console.log(`🔎 Coin IDs: ${sortedIds}, cacheKey: ${cacheKey}`);

  // Try Redis cache
  try {
    const cachedData = await getRedis().get(cacheKey);
    if (typeof cachedData === "string" && cachedData.length > 0) {
      console.log("✅ Returning coins data from Redis cache");
      return JSON.parse(cachedData);
    }
  } catch (redisError) {
    console.error("❌ Redis GET failed:", redisError);
  }

  const batchSize = 20;
  let allCoins: any[] = [];

  for (let i = 0; i < sortedIds.length; i += batchSize) {
    const batch = sortedIds.slice(i, i + batchSize).join(",");

    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
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
          timeout: 10000,
        }
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        allCoins.push(...response.data);
      } else {
        console.error("❌ CoinGecko API error:", response.statusText);
      }
    } catch (error: any) {
      console.error("❌ CoinGecko fetch error:", {
        message: error.message,
        url: error.config?.url,
        status: error.response?.status,
      });
    }

    // Avoid rate limit
    await new Promise((r) => setTimeout(r, 500));
  }

  if (allCoins.length === 0) {
    throw new Error("❌ No data returned from CoinGecko.");
  }

  // Cache fetched data
  try {
    await getRedis().set(cacheKey, JSON.stringify(allCoins));
    await getRedis().expire(cacheKey, 3600); // TTL = 1 hour
    console.log("✅ Coins data cached in Redis");
  } catch (redisSetError) {
    console.error("❌ Redis SET/EXPIRE failed:", redisSetError);
  }

  return allCoins;
}
