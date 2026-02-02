import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { nanoid } from "nanoid";
import { sendEmail, getEmailVerificationHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    await db.verificationToken.deleteMany({
      where: { identifier: email },
    });
    await db.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: getEmailVerificationHtml(token, email),
    });

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
