// app/api/user-coin/route.ts
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coinId }: { coinId: string } = body;

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.userCoin.upsert({
      where: {
        userId_coinId: {
          userId: session.user.id,
          coinId,
        },
      },
      update: {}, // Already exists — do nothing
      create: {
        userId: session.user.id,
        coinId,
      },
    });

    return Response.json({ message: "✅ Coin saved to favorites." });
  } catch (error) {
    console.error("❌ Error adding favorite coin:", error);
    return Response.json(
      { error: "Failed to add coin to favorites." },
      { status: 500 }
    );
  }
}
