import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchCoins } from "@/lib/fetchCoins";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const fromCoin = typeof body.fromCoin === "string" ? body.fromCoin : "";
  const toCoin = typeof body.toCoin === "string" ? body.toCoin : "";
  const amountNum = Number(body.amount);

  if (!fromCoin || !toCoin || !Number.isFinite(amountNum) || amountNum <= 0) {
    return NextResponse.json({ error: "Invalid trade input" }, { status: 400 });
  }

  const tradeAmount = new Prisma.Decimal(amountNum)
    .toDecimalPlaces(8, Prisma.Decimal.ROUND_DOWN)
    .toNumber();

  if (!Number.isFinite(tradeAmount) || tradeAmount <= 0) {
    return NextResponse.json({ error: "Invalid trade amount" }, { status: 400 });
  }

  if (fromCoin === toCoin) {
    return NextResponse.json(
      { error: "Cannot trade same asset" },
      { status: 400 }
    );
  }

  let fromPrice = 0;
  let toPrice = 0;
  try {
    const prices = await fetchCoins([fromCoin, toCoin], { bypassCache: true });
    const priceMap = new Map(
      prices.map((p: any) => [p.id, Number(p.current_price) || 0])
    );
    fromPrice = priceMap.get(fromCoin) || 0;
    toPrice = priceMap.get(toCoin) || 0;
  } catch (error) {
    console.error("Price fetch failed:", error);
  }

  if (!fromPrice || !toPrice) {
    return NextResponse.json(
      { error: "Unable to fetch live prices" },
      { status: 502 }
    );
  }

  const toAmount = new Prisma.Decimal(tradeAmount)
    .mul(fromPrice)
    .div(toPrice)
    .toNumber();

  try {
    const result = await db.$transaction(async (tx) => {
      const decrement = await tx.balance.updateMany({
        where: {
          userId: session.user.id,
          coinId: fromCoin,
          amount: { gte: tradeAmount },
        },
        data: { amount: { decrement: tradeAmount } },
      });

      if (decrement.count === 0) {
        throw new Error("INSUFFICIENT_FUNDS");
      }

      const upserted = await tx.balance.upsert({
        where: {
          userId_coinId: {
            userId: session.user.id,
            coinId: toCoin,
          },
        },
        update: { amount: { increment: toAmount } },
        create: {
          userId: session.user.id,
          coinId: toCoin,
          amount: toAmount,
        },
      });

      const trade = await tx.walletTrade.create({
        data: {
          userId: session.user.id,
          fromCoinId: fromCoin,
          toCoinId: toCoin,
          fromAmount: tradeAmount,
          toAmount,
          fromPrice,
          toPrice,
          status: "COMPLETED",
        },
      });

      return { upserted, trade };
    });

    return NextResponse.json({
      success: true,
      traded: {
        fromCoin,
        toCoin,
        amount: tradeAmount,
        toAmount,
        fromPrice,
        toPrice,
        tradeId: result.trade.id,
      },
    });
  } catch (error: any) {
    if (error?.message === "INSUFFICIENT_FUNDS") {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    console.error("Trade execution failed:", error);
    return NextResponse.json(
      { error: "Failed to execute trade" },
      { status: 500 }
    );
  }
}
