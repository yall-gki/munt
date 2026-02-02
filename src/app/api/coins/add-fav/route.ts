import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // ← ensure cookies are read properly

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { coinId }: { coinId: string } = body;

    const session = await getAuthSession();
    console.log("SESSION FROM DELETE:", session); // 🔹 debug

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Deleting coin:", coinId, "for user:", session.user.id);
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
