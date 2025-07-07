import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: { coinId: string } }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { coinId } = context.params;

  if (!coinId) {
    return NextResponse.json({ error: "coinId is required" }, { status: 400 });
  }

  try {
    const history = await db.portfolioHistory.findMany({
      where: {
        userId: session.user.id,
        coinId,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
