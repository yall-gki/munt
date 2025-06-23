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
    const updated = await db.strategy.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data,
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update strategy:", error);
    return new Response(JSON.stringify({ error: "Update failed." }), {
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

    await db.strategy.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify({ message: "✅ Strategy deleted." }), {
      status: 200,
    });
  } catch (error) {
    console.error("❌ Failed to delete strategy:", error);
    return new Response(JSON.stringify({ error: "Delete failed." }), {
      status: 500,
    });
  }
}
