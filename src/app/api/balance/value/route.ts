import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

// Cache number formatter
const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export async function GET(req: NextRequest) {
  try {
    // 1️⃣ Auth check
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Fetch user balances with coin info
    const balances = await db.balance.findMany({
      where: { userId: session.user.id },
      include: { coin: true },
    });

    // 3️⃣ Fetch prices
    let prices: Record<string, number> = {};
    try {
      const res = await axios.get("https://munt-api.onrender.com/all-prices");
      // Normalize keys to lowercase for safety
      prices = Object.fromEntries(
        Object.entries(res.data).map(([k, v]) => [k.toLowerCase(), Number(v)])
      );
    } catch (err: any) {
      console.error(
        `❌ Price fetch failed for user ${session.user.id}:`,
        err.message || err
      );
      // fallback: all prices zero
      balances.forEach(b => (prices[b.coinId.toLowerCase()] = 0));
    }

    // 4️⃣ Map balances to breakdown
    const breakdown = balances.map(b => {
      const amount = Number(b.amount) || 0;
      const usdValue = amount * (prices[b.coinId.toLowerCase()] || 0);
      return {
        id: b.coinId,
        name: b.coin.name,
        symbol: b.coin.symbol,
        image: b.coin.image,
        amount,
        usdValue,
        formattedUsdValue: usdFormatter.format(usdValue),
      };
    });

    // 5️⃣ Total portfolio value
    const totalValue = breakdown.reduce((sum, c) => sum + c.usdValue, 0);

    // 6️⃣ Add percentage of total for each coin
    const breakdownWithPercentage = breakdown.map(c => ({
      ...c,
      percentage: totalValue > 0 ? (c.usdValue / totalValue) * 100 : 0,
    }));

    // 7️⃣ Return response
    return NextResponse.json({
      totalValue,
      formattedTotalValue: usdFormatter.format(totalValue),
      breakdown: breakdownWithPercentage,
    });
  } catch (err: any) {
    console.error(
      `❌ Balance API error for request ${req.url}:`,
      err.message || err
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
