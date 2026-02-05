import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const strategies = await db.strategy.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const trades = await db.trade.findMany({
    where: { userId: session.user.id },
    select: {
      strategyId: true,
      amount: true,
      entryPrice: true,
      executedAt: true,
    },
  });

  const stats = new Map<
    string,
    {
      totalTrades: number;
      buyTrades: number;
      sellTrades: number;
      totalVolumeUsd: number;
      lastTradeAt: Date | null;
    }
  >();

  for (const trade of trades) {
    if (!trade.strategyId) continue;
    const current = stats.get(trade.strategyId) || {
      totalTrades: 0,
      buyTrades: 0,
      sellTrades: 0,
      totalVolumeUsd: 0,
      lastTradeAt: null as Date | null,
    };

    const isSell = trade.amount < 0;
    current.totalTrades += 1;
    current.buyTrades += isSell ? 0 : 1;
    current.sellTrades += isSell ? 1 : 0;
    current.totalVolumeUsd += Math.abs(trade.amount) * trade.entryPrice;
    if (!current.lastTradeAt || trade.executedAt > current.lastTradeAt) {
      current.lastTradeAt = trade.executedAt;
    }

    stats.set(trade.strategyId, current);
  }

  const performance = strategies.map((strategy) => {
    const summary = stats.get(strategy.id) || {
      totalTrades: 0,
      buyTrades: 0,
      sellTrades: 0,
      totalVolumeUsd: 0,
      lastTradeAt: null,
    };

    return {
      id: strategy.id,
      name: strategy.name,
      type: strategy.type,
      coinId: strategy.coinId,
      timeframe: strategy.timeframe,
      isActive: strategy.isActive,
      ...summary,
    };
  });

  return NextResponse.json({ performance });
}
