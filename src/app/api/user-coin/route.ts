import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Extract user ID from headers if session is missing
    let userId = session?.user?.id;

    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        userId = authHeader.replace("Bearer ", ""); // Extract token
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const userCoins = await db.userCoin.findMany({
      where: {
        userId: userId,
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
