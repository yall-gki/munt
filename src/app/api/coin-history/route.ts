import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis"; // 👈 your existing Redis client

const ids = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "cardano",
  "ripple",
  "polkadot",
  "uniswap",
  "chainlink",
  "litecoin",
  "stellar",
  "usdc",
  "dogecoin",
  "vechain",
  "filecoin",
  "tron",
  "eos",
  "aave",
  "monero",
  "cosmos",
  "tezos",
  "algorand",
  "nem",
  "compound",
  "kusama",
  "zilliqa",
  "neo",
  "sushiswap",
  "maker",
  "dash",
  "elrond",
];

const COINGECKO_KEY = "coingecko:market_data";

export async function GET() {
  try {
    // Check Redis cache
    const cached = await getRedis().get(COINGECKO_KEY);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch fresh data from CoinGecko
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
        ","
      )}&sparkline=true`,
      {
        headers: {
          Accept: "application/json",
        },
        // Optional: prevent Vercel's ISR from caching
        next: { revalidate: 0 },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("CoinGecko error:", errorText);
      return NextResponse.json(
        { error: "CoinGecko error", details: errorText },
        { status: 500 }
      );
    }

    const data = await res.json();

    // Cache for 5 minutes (300 seconds)
    await getRedis().set(COINGECKO_KEY, data, { ex: 300 });
    console.log(data);

    return NextResponse.json(data);
  } catch (err) {
    console.error("CoinGecko fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
