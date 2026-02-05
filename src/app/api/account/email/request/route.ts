import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { emailChangeRequestSchema } from "@/lib/validators/account";
import { verifyPassword } from "@/lib/password";
import { generateOtp, hashOtp } from "@/lib/otp";
import { sendEmail, getEmailVerificationHtml } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = emailChangeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const rawEmail = parsed.data.email.trim();
  const normalizedEmail = rawEmail.toLowerCase();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.email.toLowerCase() === normalizedEmail) {
    return NextResponse.json(
      { error: "New email must be different" },
      { status: 400 }
    );
  }

  const existingUser = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    select: { id: true },
  });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  if (user.password) {
    if (!parsed.data.password) {
      return NextResponse.json(
        { error: "Password required to change email" },
        { status: 400 }
      );
    }
    const valid = await verifyPassword(parsed.data.password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 403 }
      );
    }
  }

  const identifier = `${session.user.id}:${normalizedEmail}`;
  const cooldownSeconds = parseInt(
    process.env.OTP_RESEND_COOLDOWN_SECONDS || "60"
  );
  const now = new Date();
  const existingOtp = await db.verificationToken.findFirst({
    where: { identifier, type: "EMAIL_OTP" },
    orderBy: { createdAt: "desc" },
  });
  if (existingOtp) {
    const nextAllowed = new Date(
      existingOtp.createdAt.getTime() + cooldownSeconds * 1000
    );
    if (nextAllowed > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((nextAllowed.getTime() - now.getTime()) / 1000)
      );
      return NextResponse.json(
        {
          error: "Please wait before requesting another code.",
          retryAfterSeconds,
        },
        { status: 429 }
      );
    }
  }

  const otpCode = generateOtp(6);
  const otpToken = hashOtp(otpCode);
  const otpExpires = new Date();
  const otpTtl = parseInt(process.env.OTP_TTL_MINUTES || "10");
  otpExpires.setMinutes(otpExpires.getMinutes() + otpTtl);

  await db.verificationToken.deleteMany({
    where: { identifier, type: "EMAIL_OTP" },
  });
  await db.verificationToken.create({
    data: {
      identifier,
      token: otpToken,
      expires: otpExpires,
      type: "EMAIL_OTP",
    },
  });

  const emailResult = await sendEmail({
    to: normalizedEmail,
    subject: "Confirm your new email",
    html: getEmailVerificationHtml({ email: normalizedEmail, otpCode }),
  });

  if (!emailResult.success) {
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Verification code sent",
    email: normalizedEmail,
  });
}
