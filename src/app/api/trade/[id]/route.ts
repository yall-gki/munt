import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await req.json();
    const trade = await db.trade.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    });

    return new Response(JSON.stringify(trade), { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update trade:", error);
    return new Response(JSON.stringify({ error: "Trade update failed." }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await db.trade.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify({ message: "✅ Trade deleted." }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Failed to delete trade:", error);
    return new Response(JSON.stringify({ error: "Trade delete failed." }), {
      status: 500,
    });
  }
}
