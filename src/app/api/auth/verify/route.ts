import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ authorized: false }, { status: 401 });
  }

  return NextResponse.json({
    authorized: true,
    user: session.user,
  });
}
