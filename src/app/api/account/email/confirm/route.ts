import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailChangeConfirmSchema } from "@/lib/validators/account";
import { hashOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = emailChangeConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const rawEmail = parsed.data.email.trim();
  const normalizedEmail = rawEmail.toLowerCase();
  const identifier = `${session.user.id}:${normalizedEmail}`;
  const now = new Date();
  const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || "5");

  const activeToken = await db.verificationToken.findFirst({
    where: { identifier, type: "EMAIL_OTP" },
    orderBy: { createdAt: "desc" },
  });

  if (!activeToken) {
    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    );
  }

  if (activeToken.expires < now) {
    await db.verificationToken.deleteMany({
      where: { identifier, type: "EMAIL_OTP" },
    });
    return NextResponse.json(
      { error: "Verification code has expired" },
      { status: 400 }
    );
  }

  if (activeToken.attempts >= maxAttempts) {
    await db.verificationToken.deleteMany({
      where: { identifier, type: "EMAIL_OTP" },
    });
    return NextResponse.json(
      { error: "Too many attempts. Please request a new code." },
      { status: 429 }
    );
  }

  const token = hashOtp(parsed.data.code.trim());
  if (token !== activeToken.token) {
    await db.verificationToken.update({
      where: {
        identifier_token_type: {
          identifier: activeToken.identifier,
          token: activeToken.token,
          type: "EMAIL_OTP",
        },
      },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    );
  }

  const conflict = await db.user.findFirst({
    where: {
      email: { equals: normalizedEmail, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
    select: { id: true },
  });

  if (conflict) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  await db.$transaction(async (tx) => {
    const deleted = await tx.verificationToken.deleteMany({
      where: {
        identifier: activeToken.identifier,
        token: activeToken.token,
        type: "EMAIL_OTP",
      },
    });

    if (deleted.count === 0) {
      throw new Error("OTP_USED");
    }

    await tx.user.update({
      where: { id: session.user.id },
      data: { email: normalizedEmail, emailVerified: new Date() },
    });
  });

  return NextResponse.json({ message: "Email updated successfully" });
}
