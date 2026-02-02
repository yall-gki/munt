import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validators/auth";
import { nanoid } from "nanoid";
import { sendEmail, getEmailVerificationHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
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

    // Generate verification token
    const token = nanoid(32);
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hours

    // Create user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        username: validatedData.username || nanoid(10),
      },
    });

    // Create verification token
    await db.verificationToken.create({
      data: {
        identifier: validatedData.email,
        token,
        expires,
      },
    });

    // Send verification email
    await sendEmail({
      to: validatedData.email,
      subject: "Verify your email",
      html: getEmailVerificationHtml(token, validatedData.email),
    });

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
