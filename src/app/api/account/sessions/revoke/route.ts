import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessionRevokeSchema } from "@/lib/validators/account";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getSessionTokenFromRequest = (req: NextRequest) => {
  return (
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    ""
  );
};

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = sessionRevokeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const currentToken = getSessionTokenFromRequest(req);
  const { sessionId, revokeOthers } = parsed.data;

  if (revokeOthers) {
    const result = await db.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: currentToken ? { sessionToken: currentToken } : undefined,
      },
    });
    return NextResponse.json({ revoked: result.count });
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session id required" },
      { status: 400 }
    );
  }

  const target = await db.session.findUnique({
    where: { id: sessionId },
    select: { id: true, userId: true, sessionToken: true },
  });

  if (!target || target.userId !== session.user.id) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (currentToken && target.sessionToken === currentToken) {
    return NextResponse.json(
      { error: "Cannot revoke current session" },
      { status: 400 }
    );
  }

  await db.session.delete({ where: { id: target.id } });
  return NextResponse.json({ revoked: 1 });
}
