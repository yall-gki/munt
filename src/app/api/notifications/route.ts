import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const readParam = searchParams.get("read");
  const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 100);

  const where: Record<string, any> = { userId: session.user.id };
  if (readParam === "true") where.read = true;
  if (readParam === "false") where.read = false;

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notification.count({
      where: { userId: session.user.id, read: false },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids)
    ? body.ids.filter((id: any) => typeof id === "string")
    : [];
  const id = typeof body.id === "string" ? body.id : null;
  const read = typeof body.read === "boolean" ? body.read : null;
  const markAllRead = body.markAllRead === true;

  if (markAllRead) {
    const result = await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
    return NextResponse.json({ updated: result.count });
  }

  if (read === null || (!id && ids.length === 0)) {
    return NextResponse.json(
      { error: "Missing notification update payload" },
      { status: 400 }
    );
  }

  if (id) {
    const updated = await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { read },
    });
    return NextResponse.json({ updated: updated.count });
  }

  const updated = await db.notification.updateMany({
    where: { id: { in: ids }, userId: session.user.id },
    data: { read },
  });

  return NextResponse.json({ updated: updated.count });
}
