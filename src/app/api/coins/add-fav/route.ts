import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { coinId }: { coinId: string } = body;

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.userCoin.upsert({
      where: {
        userId_coinId: {
          userId: session.user.id,
          coinId,
        },
      },
      update: {}, // No changes needed if already exists
      create: {
        userId: session.user.id,
        coinId,
      },
    });
    return new Response(JSON.stringify({ message: "Success!" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error adding favorite coin:", error);
    return new Response(JSON.stringify({ error: "Failed to add favorite" }), {
      status: 500,
    });
  }
}
