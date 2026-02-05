import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId") || undefined;
  const strategyId = searchParams.get("strategyId") || undefined;

  const trades = await db.trade.findMany({
    where: {
      userId: session.user.id,
      coinId: coinId ? coinId : undefined,
      strategyId: strategyId ? strategyId : undefined,
    },
    orderBy: { executedAt: "desc" },
    take: 200,
    include: {
      strategy: { select: { id: true, name: true, type: true } },
      coin: { select: { id: true, name: true, symbol: true } },
    },
  });

  return NextResponse.json({ trades });
}
