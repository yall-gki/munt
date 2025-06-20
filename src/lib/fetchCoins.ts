// src/lib/fetchCoinsBrowser.ts
import axios from "axios";

export async function fetchCoins(ids: string[]): Promise<any[]> {
  if (!ids || ids.length === 0) {
    throw new Error("❌ No coin IDs provided.");
  }
  console.log("🔎 Coin IDs to fetch:", ids);

  const batchSize = 20;
  const sortedIds = [...ids].sort();
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

    // Optional: avoid triggering rate limits
    await new Promise((r) => setTimeout(r, 500));
  }

  if (allCoins.length === 0) {
    throw new Error("❌ No data returned from CoinGecko.");
  }

  return allCoins;
}
