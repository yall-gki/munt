import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { profileUpdateSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      emailVerified: true,
      password: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      emailVerified: user.emailVerified,
    },
    hasPassword: !!user.password,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const updates = parsed.data;
  if (!updates.name && !updates.username && !updates.image) {
    return NextResponse.json(
      { error: "No profile fields provided" },
      { status: 400 }
    );
  }

  if (updates.username) {
    const existing = await db.user.findFirst({
      where: {
        username: { equals: updates.username, mode: "insensitive" },
        NOT: { id: session.user.id },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      name: updates.name ?? undefined,
      username: updates.username ?? undefined,
      image: updates.image ?? undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      emailVerified: true,
    },
  });

  return NextResponse.json({ user });
}
