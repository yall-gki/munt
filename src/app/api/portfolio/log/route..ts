import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { coinId: string } }
) {
  const session = await getAuthSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { coinId } = context.params;

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

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
