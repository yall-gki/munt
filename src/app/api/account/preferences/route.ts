import { NextRequest, NextResponse } from "next/server";
import { preferencesSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COOKIE_NAME = "munt_prefs";

const parsePreferences = (value: string | undefined) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    const validated = preferencesSchema.safeParse(parsed);
    return validated.success ? validated.data : null;
  } catch {
    return null;
  }
};

export async function GET(req: NextRequest) {
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  const prefs = parsePreferences(cookieValue) ?? preferencesSchema.parse({});
  return NextResponse.json({ preferences: prefs });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ preferences: parsed.data });
  response.cookies.set(COOKIE_NAME, JSON.stringify(parsed.data), {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
