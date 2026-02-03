import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { sendEmail, getEmailVerificationHtml } from "@/lib/email";
import { generateOtp, hashOtp } from "@/lib/otp";
import { requestOtpSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = requestOtpSchema.safeParse(body);
    let email = parsed.success ? parsed.data.email : null;
    if (!email) {
      const session = await getAuthSession();
      email = session?.user?.email ?? null;
    }
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const rawEmail = email.trim();
    const normalizedEmail = rawEmail.toLowerCase();

    const user = await db.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (!user || user.emailVerified || !user.password) {
      return NextResponse.json(
        { message: "If an account exists, a verification email has been sent" },
        { status: 200 }
      );
    }

    const cooldownSeconds = parseInt(
      process.env.OTP_RESEND_COOLDOWN_SECONDS || "60"
    );
    const now = new Date();
    const existingOtp = await db.verificationToken.findFirst({
      where: { identifier: { in: [normalizedEmail, rawEmail] }, type: "EMAIL_OTP" },
      orderBy: { createdAt: "desc" },
    });

    if (existingOtp && existingOtp.expires > now) {
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
            errorCode: "RESEND_RATE_LIMITED",
            retryAfterSeconds,
          },
          { status: 429 }
        );
      }
    }

    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    const otpCode = generateOtp(6);
    const otpToken = hashOtp(otpCode);
    const otpExpires = new Date();
    const otpTtl = parseInt(process.env.OTP_TTL_MINUTES || "10");
    otpExpires.setMinutes(otpExpires.getMinutes() + otpTtl);

    await db.verificationToken.deleteMany({
      where: {
        identifier: { in: [normalizedEmail, rawEmail] },
        type: { in: ["EMAIL_VERIFY", "EMAIL_OTP"] },
      },
    });
    await db.verificationToken.createMany({
      data: [
        { identifier: normalizedEmail, token, expires, type: "EMAIL_VERIFY" },
        {
          identifier: normalizedEmail,
          token: otpToken,
          expires: otpExpires,
          type: "EMAIL_OTP",
        },
      ],
    });

    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email",
      html: getEmailVerificationHtml({ email: normalizedEmail, token, otpCode }),
    });
    if (!emailResult.success) {
      throw new Error("Failed to send verification email");
    }

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
