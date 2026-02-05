import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balances = await db.balance.findMany({
    where: { userId: session.user.id },
    include: { coin: true },
  });

  // Fetch all prices from FastAPI backend
  let prices: Record<string, number> = {};
  try {
    const res = await axios.get("https://munt-api.onrender.com/all-prices");
    prices = res.data; // should be { bitcoin: 27770.12, ethereum: 1860.45, ... }
  } catch (err: any) {
    console.error("❌ FastAPI price fetch failed:", err.message || err);
    // fallback: set all prices to 0
    balances.forEach(b => prices[b.coinId] = 0);
  }

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const breakdown = balances.map((b) => {
    const amount = Number(b.amount) || 0;
    const usdValue = amount * (prices[b.coinId] || 0);
    return {
      id: b.coinId,
      name: b.coin.name,
      symbol: b.coin.symbol,
      image: b.coin.image,
      amount,
      usdValue,
      formattedUsdValue: formatter.format(usdValue),
    };
  });

  const totalValue = breakdown.reduce((sum, c) => sum + c.usdValue, 0);

  return NextResponse.json({
    totalValue,
    formattedTotalValue: formatter.format(totalValue),
    breakdown: breakdown.map((c) => ({
      ...c,
      percentage: totalValue > 0 ? (c.usdValue / totalValue) * 100 : 0,
    })),
  });
}
