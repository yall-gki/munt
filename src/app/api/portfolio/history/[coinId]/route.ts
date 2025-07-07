import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { coinId: string } }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const coinId = params.coinId;

  try {
    const history = await db.portfolioHistory.findMany({
      where: {
        userId,
        coinId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching coin history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
