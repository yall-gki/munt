import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validators/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = verifyEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const token = parsed.data.token;
    const rawEmail = parsed.data.email.trim();
    const email = rawEmail.toLowerCase();

    // Find verification token
    const user = await db.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      await db.verificationToken.deleteMany({
        where: {
          identifier: { in: [email, rawEmail] },
          type: { in: ["EMAIL_VERIFY", "EMAIL_OTP"] },
        },
      });
      return NextResponse.json(
        { message: "Email already verified", alreadyVerified: true },
        { status: 200 }
      );
    }

    const verificationToken = await db.verificationToken.findUnique({
      where: {
        identifier_token_type: {
          identifier: email,
          token,
          type: "EMAIL_VERIFY",
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
                type: "EMAIL_VERIFY",
              },
            },
          })
        : null;

    const activeToken = verificationToken ?? fallbackToken;

    if (!activeToken) {
      return NextResponse.json(
        { error: "Invalid verification token", errorCode: "VERIFY_INVALID" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (activeToken.expires < new Date()) {
      await db.verificationToken.deleteMany({
        where: {
          identifier: { in: [email, rawEmail] },
          type: "EMAIL_VERIFY",
        },
      });
      return NextResponse.json(
        { error: "Verification token has expired", errorCode: "VERIFY_EXPIRED" },
        { status: 400 }
      );
    }

    try {
      await db.$transaction(async (tx) => {
        const deleted = await tx.verificationToken.deleteMany({
          where: {
            identifier: activeToken.identifier,
            token: activeToken.token,
            type: "EMAIL_VERIFY",
          },
        });

        if (deleted.count === 0) {
          throw new Error("VERIFY_USED");
        }

        await tx.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });

        await tx.verificationToken.deleteMany({
          where: { identifier: { in: [email, rawEmail] }, type: "EMAIL_OTP" },
        });
      });
    } catch (transactionError: any) {
      if (transactionError?.message === "VERIFY_USED") {
        return NextResponse.json(
          {
            error: "Verification link has already been used.",
            errorCode: "VERIFY_USED",
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
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
