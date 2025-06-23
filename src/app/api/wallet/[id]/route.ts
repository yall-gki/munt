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

    const { isActive } = await req.json();

    const updated = await db.wallet.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: { isActive },
    });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("❌ Failed to update wallet:", error);
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

    await db.wallet.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    return new Response(
      JSON.stringify({ message: "✅ Wallet disconnected." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Failed to delete wallet:", error);
    return new Response(JSON.stringify({ error: "Delete failed." }), {
      status: 500,
    });
  }
}
