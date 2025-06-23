import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { strategyId, coinId, entryPrice, amount, mode } = await req.json();

    const trade = await db.trade.create({
      data: {
        userId: session.user.id,
        strategyId,
        coinId,
        entryPrice,
        amount,
        mode,
        status: "OPEN",
      },
    });

    return new Response(JSON.stringify(trade), { status: 201 });
  } catch (error) {
    console.error("❌ Failed to place trade:", error);
    return new Response(JSON.stringify({ error: "Trade creation failed." }), {
      status: 500,
    });
  }
}
