import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const strategyTypes = [
  "DCAa",
  "GRID",
  "INDICATOR",
  "MANUAL",
  "HODL",
  "DCA",
  "SWING",
  "REBALANCING",
  "STAKING",
  "HISTORICAL_SIMULATION",
] as const;

const strategySchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  type: z.enum(strategyTypes),
  settings: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  coinId: z.string().optional(),
  coinIds: z.array(z.string()).optional(),
  timeframe: z.string().optional(),
  isActive: z.boolean().optional(),
});

const strategyUpdateSchema = strategySchema.partial().extend({
  id: z.string().optional(),
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
  const allCoinIds = [
    ...(data.coinId ? [data.coinId] : []),
    ...(data.coinIds ?? []),
  ];
  if (allCoinIds.length > 0) {
    const coins = await db.coin.findMany({
      where: { id: { in: allCoinIds } },
      select: { id: true },
    });
    if (coins.length !== new Set(allCoinIds).size) {
      return NextResponse.json(
        { error: "Unsupported coin selection" },
        { status: 400 }
      );
    }
  }

  const parameters = data.parameters ?? data.settings ?? {};
  const settings = data.settings ?? parameters;

  const strategy = await db.strategy.create({
    data: {
      userId: session.user.id,
      name: data.name,
      type: data.type,
      settings,
      parameters: Object.keys(parameters).length ? parameters : undefined,
      coinId: data.coinId ?? data.coinIds?.[0],
      timeframe: data.timeframe,
      isActive: data.isActive ?? false,
    },
  });

  await db.notification.create({
    data: {
      userId: session.user.id,
      type: "USER_ACTION",
      message: `Strategy created: ${strategy.name}`,
      link: "/wallet",
    },
  });

  return NextResponse.json({ strategy }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = strategyUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const { id, ...data } = parsed.data;
  const strategyId = typeof id === "string" ? id : undefined;
  if (!strategyId) {
    return NextResponse.json({ error: "Missing strategy id" }, { status: 400 });
  }

  const existing = await db.strategy.findFirst({
    where: { id: strategyId, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  const allCoinIds = [
    ...(data.coinId ? [data.coinId] : []),
    ...(data.coinIds ?? []),
  ];
  if (allCoinIds.length > 0) {
    const coins = await db.coin.findMany({
      where: { id: { in: allCoinIds } },
      select: { id: true },
    });
    if (coins.length !== new Set(allCoinIds).size) {
      return NextResponse.json(
        { error: "Unsupported coin selection" },
        { status: 400 }
      );
    }
  }

  const parameters = data.parameters ?? data.settings ?? undefined;
  const next = await db.strategy.update({
    where: { id: strategyId },
    data: {
      name: data.name ?? undefined,
      type: data.type ?? undefined,
      settings: data.settings ?? (parameters ?? undefined),
      parameters,
      coinId: data.coinId ?? data.coinIds?.[0] ?? undefined,
      timeframe: data.timeframe ?? undefined,
      isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
    },
  });

  return NextResponse.json({ strategy: next });
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing strategy id" }, { status: 400 });
  }

  const existing = await db.strategy.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
  }

  await db.strategy.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
