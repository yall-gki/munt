import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAccountSchema } from "@/lib/validators/account";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.errors },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, password: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.password) {
    if (!parsed.data.password) {
      return NextResponse.json(
        { error: "Password required to delete account" },
        { status: 400 }
      );
    }
    const valid = await verifyPassword(parsed.data.password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 403 }
      );
    }
  }

  const normalizedEmail = user.email.toLowerCase();

  await db.$transaction(async (tx) => {
    await tx.walletTrade.deleteMany({ where: { userId: user.id } });
    await tx.trade.deleteMany({ where: { userId: user.id } });
    await tx.backtest.deleteMany({ where: { userId: user.id } });
    await tx.strategy.deleteMany({ where: { userId: user.id } });
    await tx.balance.deleteMany({ where: { userId: user.id } });
    await tx.portfolioHistory.deleteMany({ where: { userId: user.id } });
    await tx.userCoin.deleteMany({ where: { userId: user.id } });
    await tx.wallet.deleteMany({ where: { userId: user.id } });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({
      where: { identifier: { in: [user.email, normalizedEmail] } },
    });
    await tx.user.delete({ where: { id: user.id } });
  });

  return NextResponse.json({ message: "Account deleted" });
}
