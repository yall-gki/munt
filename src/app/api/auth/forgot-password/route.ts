import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { nanoid } from "nanoid";
import { sendEmail, getPasswordResetHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const rawEmail = parsed.data.email.trim();
    const normalizedEmail = rawEmail.toLowerCase();

    const user = await db.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "If an account exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour

    // Delete any existing reset tokens for this email
    await db.verificationToken.deleteMany({
      where: {
        identifier: { in: [normalizedEmail, rawEmail] },
        type: "PASSWORD_RESET",
      },
    });

    // Create new reset token
    await db.verificationToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        expires,
        type: "PASSWORD_RESET",
      },
    });

    // Send reset email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Reset your password",
      html: getPasswordResetHtml(token, normalizedEmail),
    });
    if (!emailResult.success) {
      throw new Error("Failed to send reset email");
    }

    return NextResponse.json(
      { message: "If an account exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
