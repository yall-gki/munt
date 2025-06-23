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

    const body = await req.json();
    const { name, type, settings, coinId, timeframe } = body;

    const strategy = await db.strategy.create({
      data: {
        userId: session.user.id,
        name,
        type,
        settings,
        coinId,
        timeframe,
      },
    });

    return new Response(JSON.stringify(strategy), { status: 201 });
  } catch (error) {
    console.error("❌ Failed to create strategy:", error);
    return new Response(JSON.stringify({ error: "Something went wrong." }), {
      status: 500,
    });
  }
}
