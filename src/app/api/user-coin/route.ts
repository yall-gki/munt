import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    // Try to get session using NextAuth
    const session = await getServerSession(authOptions);

    // Fallback: Try extracting user ID from Authorization header
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

    // Get user's favorite coins
    const userCoins = await db.userCoin.findMany({
      where: { userId },
      select: { coinId: true }, // Only return coin IDs
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
