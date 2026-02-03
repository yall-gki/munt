import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validators/auth";
import { nanoid } from "nanoid";
import { sendEmail, getEmailVerificationHtml } from "@/lib/email";
import { generateOtp, hashOtp } from "@/lib/otp";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signUpSchema.parse(body);
    const normalizedEmail = validatedData.email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check username if provided
    if (validatedData.username) {
      const existingUsername = await db.user.findUnique({
        where: { username: validatedData.username },
      });

      if (existingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Generate verification link token + OTP
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours
    const otpCode = generateOtp(6);
    const otpToken = hashOtp(otpCode);
    const otpExpires = new Date();
    const otpTtl = parseInt(process.env.OTP_TTL_MINUTES || "10");
    otpExpires.setMinutes(otpExpires.getMinutes() + otpTtl);

    // Create user
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: validatedData.name,
        username: validatedData.username || nanoid(10),
      },
    });

    // Create verification tokens (link + OTP)
    await db.verificationToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        type: { in: ["EMAIL_VERIFY", "EMAIL_OTP"] },
      },
    });
    await db.verificationToken.createMany({
      data: [
        {
          identifier: normalizedEmail,
          token,
          expires,
          type: "EMAIL_VERIFY",
        },
        {
          identifier: normalizedEmail,
          token: otpToken,
          expires: otpExpires,
          type: "EMAIL_OTP",
        },
      ],
    });

    // Send verification email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Verify your email",
      html: getEmailVerificationHtml({
        email: normalizedEmail,
        token,
        otpCode,
      }),
    });
    if (!emailResult.success) {
      throw new Error("Failed to send verification email");
    }

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
