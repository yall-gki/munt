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

    const { provider, address } = await req.json();

    const wallet = await db.wallet.create({
      data: {
        userId: session.user.id,
        provider,
        address,
      },
    });

    return new Response(JSON.stringify(wallet), { status: 201 });
  } catch (error) {
    console.error("❌ Failed to connect wallet:", error);
    return new Response(JSON.stringify({ error: "Failed to add wallet." }), {
      status: 500,
    });
  }
}
