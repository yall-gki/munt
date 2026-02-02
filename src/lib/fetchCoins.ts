import axios from "axios";
import { getRedis } from "./redis"; // Ensure correct path

const API_BASE = "https://munt-api.onrender.com"; // Your FastAPI backend

export async function fetchCoins(ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) {
    throw new Error("No coin IDs provided.");
  }

  const sortedIds = [...ids].sort();
  const cacheKey = `coinsData-${sortedIds.join(",")}`;
  console.log(`Coin IDs: ${sortedIds}, cacheKey: ${cacheKey}`);

  // Try Redis cache
  try {
    const cachedData = await getRedis().get(cacheKey);
    if (typeof cachedData === "string" && cachedData.length > 0) {
      console.log("Returning coins data from Redis cache");
      return JSON.parse(cachedData);
    }
  } catch (redisError) {
    console.error("Redis GET failed:", redisError);
  }

  let allCoins: any[] = [];

  try {
    const response = await axios.get(`${API_BASE}/all-prices`, {
      timeout: 10000,
    });

    if (response.status === 200 && response.data) {
      // Filter to requested IDs
      allCoins = sortedIds.map((id) => {
        const price = response.data[id] ?? 0;
        return {
          id,
          current_price: price,
        };
      });
    } else {
      console.error("FastAPI /all-prices error:", response.statusText);
    }
  } catch (error: any) {
    console.error("FastAPI fetch error:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
    });
  }

  if (allCoins.length === 0) {
    throw new Error("No data returned from FastAPI backend.");
  }

  // Cache fetched data
  try {
    await getRedis().set(cacheKey, JSON.stringify(allCoins));
    await getRedis().expire(cacheKey, 3600); // TTL = 1 hour
    console.log("Coins data cached in Redis");
  } catch (redisSetError) {
    console.error("Redis SET/EXPIRE failed:", redisSetError);
  }

  return allCoins;
}
