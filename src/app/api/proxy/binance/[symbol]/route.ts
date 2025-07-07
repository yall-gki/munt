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
    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Binance fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Binance" },
      { status: 500 }
    );
  }
}
