import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const session = await getAuthSession();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const days = parseInt(req.nextUrl.searchParams.get("days") || "30");
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const history = await db.portfolioHistory.findMany({
    where: {
      userId: session.user.id,
      coinId: params.coinId,
      date: { gte: fromDate },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(
    history.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      value: Number(entry.usdValue.toFixed(2)),
    }))
  );
}
