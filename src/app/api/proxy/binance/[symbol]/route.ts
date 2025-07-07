import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { symbol: string } }
) {
  const { symbol } = context.params;

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      `Proxy Binance fetch failed for ${symbol}`,
      error?.message || error
    );
    return NextResponse.json(
      { error: "Failed to fetch price from Binance" },
      { status: 500 }
    );
  }
}
