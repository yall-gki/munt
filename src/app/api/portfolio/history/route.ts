import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { coinId: string } }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { coinId } = params;

  if (!coinId) {
    return NextResponse.json({ error: "Missing coinId" }, { status: 400 });
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
    console.error("Portfolio history error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
