import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const coinParam = searchParams.get("coin");
  const limit = Math.min(Math.max(Number(limitParam) || 25, 1), 100);

  const where: Record<string, any> = { userId: session.user.id };
  if (coinParam) {
    where.OR = [{ fromCoinId: coinParam }, { toCoinId: coinParam }];
  }

  const trades = await db.walletTrade.findMany({
    where,
    orderBy: { executedAt: "desc" },
    take: limit,
    include: {
      fromCoin: true,
      toCoin: true,
    },
  });

  return NextResponse.json({ trades });
}
