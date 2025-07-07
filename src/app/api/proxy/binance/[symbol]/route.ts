// src/app/api/proxy/binance/[symbol]/route.ts

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  // Parse URL to extract the symbol param
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const symbol = parts[parts.length - 1]?.toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Binance proxy error for ${symbol}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch from Binance" },
      { status: 500 }
    );
  }
}
