// app/api/news/route.ts (Next 13+)
import axios from "axios";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin") || "";
  const apiKey = process.env.CRYPTO_NEWS_API_KEY;

  if (!coin || !apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing coin or API key" }),
      { status: 400 }
    );
  }

  try {
    const tickers = coin.toUpperCase(); // e.g., BTC, ETH
    const res = await axios.get(
      `https://api.cryptonews-api.com/api/v1?tickers=${tickers}&items=10&token=${apiKey}`
    );

    return Response.json(res.data);
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch news" }),
      { status: 500 }
    );
  }
}
