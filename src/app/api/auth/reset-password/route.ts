import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const rawEmail = parsed.data.email.trim();
    const email = rawEmail.toLowerCase();
    const { token, password } = parsed.data;

    // Find verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        identifier_token_type: {
          identifier: email,
          token,
          type: "PASSWORD_RESET",
        },
      },
    });

    const fallbackToken =
      !verificationToken && rawEmail !== email
        ? await db.verificationToken.findUnique({
            where: {
              identifier_token_type: {
                identifier: rawEmail,
                token,
                type: "PASSWORD_RESET",
              },
            },
          })
        : null;

    const activeToken = verificationToken ?? fallbackToken;

    if (!activeToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (activeToken.expires < new Date()) {
      await db.verificationToken.deleteMany({
        where: {
          identifier: { in: [email, rawEmail] },
          type: "PASSWORD_RESET",
        },
      });
      return NextResponse.json(
        { error: "Reset token has expired" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await db.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Delete used token
    await db.verificationToken.deleteMany({
      where: {
        identifier: { in: [email, rawEmail] },
        token,
        type: "PASSWORD_RESET",
      },
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
