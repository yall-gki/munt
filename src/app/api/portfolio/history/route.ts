import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId");

  if (!coinId) {
    return NextResponse.json({ error: "Missing coinId" }, { status: 400 });
  }

  const history = await db.portfolioHistory.findMany({
    where: {
      userId: session.user.id,
      coinId,
    },
    orderBy: {
      date: "asc", // Use 'date' as defined in the PortfolioHistory model
    },
    select: {
      usdValue: true,
      date: true,
    },
  });

  const result = history.map((h) => ({
    date: h.date.toISOString(),
    value: h.usdValue,
  }));

  return NextResponse.json(result);
}
