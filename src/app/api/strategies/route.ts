import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const strategySchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  type: z.enum(["DCAa", "GRID", "INDICATOR", "MANUAL"]),
  settings: z.record(z.any()).default({}),
  coinId: z.string().optional(),
  timeframe: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const coinId = searchParams.get("coinId") || undefined;

  const strategies = await db.strategy.findMany({
    where: {
      userId: session.user.id,
      coinId: coinId ? coinId : undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ strategies });
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = strategySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const data = parsed.data;
  if (data.coinId) {
    const coin = await db.coin.findUnique({
      where: { id: data.coinId },
      select: { id: true },
    });
    if (!coin) {
      return NextResponse.json(
        { error: "Unsupported coin" },
        { status: 400 }
      );
    }
  }

  const strategy = await db.strategy.create({
    data: {
      userId: session.user.id,
      name: data.name,
      type: data.type,
      settings: data.settings ?? {},
      coinId: data.coinId,
      timeframe: data.timeframe,
      isActive: data.isActive ?? false,
    },
  });

  return NextResponse.json({ strategy }, { status: 201 });
}
