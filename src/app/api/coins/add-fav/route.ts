import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { coinCatalogById } from "@/lib/coinCatalog";

export const dynamic = "force-dynamic"; // ← ensure cookies are read properly

const jsonHeaders = { "Content-Type": "application/json" };

const ensureCoinExists = async (coinId: string) => {
  const seed = coinCatalogById.get(coinId);
  if (!seed) return false;

  await db.coin.upsert({
    where: { id: coinId },
    update: {},
    create: {
      ...seed,
      image: seed.image ?? null,
    },
  });

  return true;
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const coinId: string | undefined = body?.coinId;

    if (!coinId) {
      return new Response(JSON.stringify({ error: "Missing coinId" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const session = await getAuthSession();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const ensured = await ensureCoinExists(coinId);
    if (!ensured) {
      return new Response(JSON.stringify({ error: "Unknown coin" }), {
        status: 400,
        headers: jsonHeaders,
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
        headers: jsonHeaders,
      }
    );
  } catch (error) {
    console.error("❌ Error adding favorite coin:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add coin to favorites." }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { coinId }: { coinId?: string } = body;

    const session = await getAuthSession();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    if (!coinId) {
      return new Response(JSON.stringify({ error: "Missing coinId" }), {
        status: 400,
        headers: jsonHeaders,
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
        headers: jsonHeaders,
      }
    );
  } catch (error) {
    console.error("❌ Error removing favorite coin:", error);
    return new Response(
      JSON.stringify({ error: "Failed to remove coin from favorites." }),
      {
        status: 500,
        headers: jsonHeaders,
      }
    );
  }
}
