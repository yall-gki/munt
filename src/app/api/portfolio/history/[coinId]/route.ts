// src/app/api/portfolio/history/[coinId]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  // 1. Authenticate user
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Extract coinId, skip & take params
  const url = new URL(req.url);
  const coinId = url.pathname.split("/").pop();
  const skip = parseInt(url.searchParams.get("skip") || "0", 10);
  const take = parseInt(url.searchParams.get("take") || "100", 10);

  if (!coinId) {
    return NextResponse.json({ error: "Missing coinId" }, { status: 400 });
  }

  // 3. Fetch rows, ordered by date ascending
  const rows = await db.portfolioHistory.findMany({
    where: {
      userId: session.user.id,
      coinId,
    },
    skip,
    take,
    orderBy: { date: "asc" },
  });

  // 4. Map to shape: { date: string, value: number }
  const history = rows.map((row) => ({
    date: row.date.toISOString(),
    value: row.usdValue,
  }));

  // 5. Return JSON array
  return NextResponse.json(history);
}
