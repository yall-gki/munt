import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const backtest = await db.backtest.create({
      data: {
        ...body,
        strategy: { connect: { id: body.strategyId } },
      },
    });

    return new Response(JSON.stringify(backtest), { status: 201 });
  } catch (error) {
    console.error("❌ Failed to save backtest:", error);
    return new Response(JSON.stringify({ error: "Backtest save failed." }), { status: 500 });
  }
}
