import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { passwordChangeSchema } from "@/lib/validators/account";
import { hashPassword, verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.password) {
    return NextResponse.json(
      { error: "Password not set for this account" },
      { status: 400 }
    );
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.password
  );
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 403 }
    );
  }

  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "New password must be different" },
      { status: 400 }
    );
  }

  const hashed = await hashPassword(parsed.data.newPassword);
  await db.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: "Password updated successfully" });
}
