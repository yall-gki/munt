import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { hashOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const rawEmail = parsed.data.email.trim();
    const email = rawEmail.toLowerCase();
    const code = parsed.data.code.trim();
    const now = new Date();
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS || "5");

    const activeToken = await db.verificationToken.findFirst({
      where: { identifier: { in: [email, rawEmail] }, type: "EMAIL_OTP" },
      orderBy: { createdAt: "desc" },
    });

    if (!activeToken) {
      return NextResponse.json(
        { error: "Invalid verification code", errorCode: "OTP_INVALID" },
        { status: 400 }
      );
    }

    if (activeToken.expires < now) {
      await db.verificationToken.deleteMany({
        where: { identifier: { in: [email, rawEmail] }, type: "EMAIL_OTP" },
      });
      return NextResponse.json(
        { error: "Verification code has expired", errorCode: "OTP_EXPIRED" },
        { status: 400 }
      );
    }

    if (activeToken.attempts >= maxAttempts) {
      await db.verificationToken.deleteMany({
        where: { identifier: { in: [email, rawEmail] }, type: "EMAIL_OTP" },
      });
      return NextResponse.json(
        {
          error: "Too many attempts. Please request a new code.",
          errorCode: "OTP_MAX_ATTEMPTS",
        },
        { status: 429 }
      );
    }

    const token = hashOtp(code);
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
        { error: "Invalid verification code", errorCode: "OTP_INVALID" },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      await db.verificationToken.deleteMany({
        where: {
          identifier: { in: [email, rawEmail] },
          type: { in: ["EMAIL_OTP", "EMAIL_VERIFY"] },
        },
      });
      return NextResponse.json(
        { message: "Email already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    try {
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
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });

        await tx.verificationToken.deleteMany({
          where: { identifier: { in: [email, rawEmail] }, type: "EMAIL_VERIFY" },
        });
      });
    } catch (transactionError: any) {
      if (transactionError?.message === "OTP_USED") {
        return NextResponse.json(
          {
            error: "Verification code has already been used.",
            errorCode: "OTP_USED",
          },
          { status: 400 }
        );
      }
      throw transactionError;
    }

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    );
  }
}
