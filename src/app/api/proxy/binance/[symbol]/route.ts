// Proxy route to Binance API

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const symbol = parts[parts.length - 1]?.toUpperCase();

  console.log("🔍 Received symbol:", symbol);
  console.log("📂 Full URL:", req.url);

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`❌ Binance proxy error for ${symbol}:`, {
      message: error.message,
      status: error?.response?.status,
      response: error?.response?.data,
    });
    return NextResponse.json(
      {
        error: "Failed to fetch from Binance",
        detail: error?.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}
