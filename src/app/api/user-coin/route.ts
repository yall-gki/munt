import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Get favorites
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;

    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        userId = authHeader.replace("Bearer ", "").trim();
      }
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing user ID" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userCoins = await db.userCoin.findMany({
      where: { userId },
      select: { coinId: true },
    });

    return new Response(JSON.stringify(userCoins), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching user coins:", error);
    return new Response(
      JSON.stringify({ error: "Could not fetch user coins" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Add to favorites
export async function POST(req: Request) {
  try {
    const { coinId }: { coinId: string } = await req.json();
    const session = await getServerSession(authOptions);

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

// Remove from favorites
export async function DELETE(req: Request) {
  try {
    const { coinId }: { coinId: string } = await req.json();
    const session = await getServerSession(authOptions);

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
