import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const getSessionTokenFromRequest = (req: NextRequest) => {
  return (
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    req.cookies.get("next-auth.session-token")?.value ||
    ""
  );
};

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentToken = getSessionTokenFromRequest(req);
  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    orderBy: { expires: "desc" },
  });

  const data = sessions.map((item) => ({
    id: item.id,
    expires: item.expires,
    isCurrent: currentToken && item.sessionToken === currentToken,
    tokenSuffix: item.sessionToken.slice(-6),
  }));

  return NextResponse.json({ sessions: data });
}
