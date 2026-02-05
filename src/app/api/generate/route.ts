import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { coinCatalog } from "@/lib/coinCatalog";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If user already has any balances, do nothing
    const existingCount = await db.balance.count({
      where: { userId: session.user.id },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        { message: "Balances already initialized" },
        { status: 200 }
      );
    }

    // Fetch all available coins
    let coins = await db.coin.findMany();

    // Seed default coins if none exist
    if (!coins.length && coinCatalog.length > 0) {
      await db.coin.createMany({
        data: coinCatalog.map((coin) => ({
          ...coin,
          image: coin.image ?? null,
        })),
        skipDuplicates: true,
      });
      coins = await db.coin.findMany();
    }

    if (!coins.length) {
      return NextResponse.json(
        { error: "No coins available to initialize balances" },
        { status: 400 }
      );
    }

    // Create balance entries of 100 units for each coin
    await db.balance.createMany({
      data: coins.map((coin) => ({
        userId: session.user.id,
        coinId: coin.id,
        amount: 100,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: "Balances generated successfully",
        created: coins.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error generating balances:", error);
    return NextResponse.json(
      { error: "Failed to generate balances" },
      { status: 500 }
    );
  }
}
