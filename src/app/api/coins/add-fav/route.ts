// app/api/user-coin/route.ts
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coinId }: { coinId: string } = body;

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.userCoin.upsert({
      where: {
        userId_coinId: {
          userId: session.user.id,
          coinId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        coinId,
      },
    });

    return new Response(
      JSON.stringify({ message: "✅ Coin saved to favorites." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error adding favorite coin:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add coin to favorites." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
