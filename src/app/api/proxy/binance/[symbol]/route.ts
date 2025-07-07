import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(
  req: NextRequest,
  context: { params: { symbol: string } }
) {
  const symbol = context.params.symbol.toUpperCase();

  try {
    const { data } = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching ${symbol} from Binance:`, error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
