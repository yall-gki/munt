import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const coinId = url.pathname.split("/").pop();
  const skip = parseInt(url.searchParams.get("skip") || "0");
  const take = parseInt(url.searchParams.get("take") || "100");

  if (!coinId) {
    return NextResponse.json({ error: "Missing coinId" }, { status: 400 });
  }

  const history = await db.portfolioHistory.findMany({
    where: {
      userId: session.user.id,
      coinId,
    },
    skip,
    take,
    orderBy: {
      date: "asc",
    },
  });

  return NextResponse.json(history);
}
