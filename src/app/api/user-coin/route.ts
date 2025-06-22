import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

// 🔁 Get all favorites
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const favorites = await db.userCoin.findMany({
      where: { userId: session.user.id },
      select: { coinId: true },
    });

    return new Response(JSON.stringify(favorites), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching favorites:", error);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ✅ Add to favorites
export async function POST(req: Request) {
  try {
    const { coinId }: { coinId: string } = await req.json();

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Prevent duplicates (optional, Prisma compound key should also guard)
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
      JSON.stringify({ message: "✅ Coin added to favorites." }),
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

export async function DELETE(req: Request) {
  try {
    // ✅ Use await req.json() properly
    const body = await req.json();
    const coinId: string = body.coinId;

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.userCoin.delete({
      where: {
        userId_coinId: {
          userId: session.user.id,
          coinId,
        },
      },
    });

    return new Response(
      JSON.stringify({ message: "✅ Coin removed from favorites." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error removing favorite coin:", error);
    return new Response(
      JSON.stringify({ error: "Failed to remove coin from favorites." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
