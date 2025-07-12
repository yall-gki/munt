import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fromCoin, toCoin, amount } = await req.json();

  if (!fromCoin || !toCoin || !amount || isNaN(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid trade input" }, { status: 400 });
  }

  if (fromCoin === toCoin) {
    return NextResponse.json(
      { error: "Cannot trade same asset" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      balances: true,
    },
  });

  const fromBalance = user?.balances.find((b) => b.coinId === fromCoin);
  const toBalance = user?.balances.find((b) => b.coinId === toCoin);

  if (!fromBalance || new Decimal(fromBalance.amount).lt(amount)) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  // Fake exchange rate (can be dynamic)
  const exchangeRate = 0.94;
  const toAmount = amount * exchangeRate;

  await db.$transaction([
    db.balance.update({
      where: { id: fromBalance.id },
      data: {
        amount: new Decimal(fromBalance.amount).minus(amount).toNumber(),
      },
    }),
    db.balance.upsert({
      where: {
        userId_coinId: {
          userId: session.user.id,
          coinId: toCoin,
        },
      },
      update: {
        amount: new Decimal(toBalance?.amount ?? 0).plus(toAmount).toNumber(),
      },
      create: {
        userId: session.user.id,
        coinId: toCoin,
        amount: new Decimal(toAmount).toNumber(),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    traded: { fromCoin, toCoin, amount, toAmount },
  });
}
