import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 🧾 Get latest daily snapshot from history table
  const latestHistory :any = await db.portfolioHistory.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 1,
    include: { coins: true },
  });

  if (!latestHistory.length) {
    return NextResponse.json({
      totalValue: 0,
      formattedTotalValue: "$0.00",
      breakdown: [],
    });
  }

  const latest = latestHistory[0];
  const coins : any= latest.coins;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const totalValueRaw = coins.reduce((acc : any, c : any) => acc + c.usdValue, 0);
  const pieData = coins.map((c : any) => ({
    id: c.coinId,
    name: c.name,
    symbol: c.symbol,
    amount: c.amount,
    usdValue: c.usdValue,
    formattedUsdValue: formatter.format(c.usdValue),
    percentage: totalValueRaw > 0 ? (c.usdValue / totalValueRaw) * 100 : 0,
  }));

  return NextResponse.json({
    totalValue: totalValueRaw,
    formattedTotalValue: formatter.format(totalValueRaw),
    breakdown: pieData,
  });
}
