import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Import authOptions if using custom auth config

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const userCoins = await db.userCoin.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        coinId: true, // Only return coin IDs
      },
    });

    return new Response(JSON.stringify(userCoins), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Could not fetch coins" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
