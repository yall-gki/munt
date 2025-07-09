// src/app/api/balance/value/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

// Map your internal coin IDs directly to CoinGecko IDs:
const coinToGeckoId: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  binancecoin: "binancecoin",
  cardano: "cardano",
  ripple: "ripple",
  polkadot: "polkadot",
  uniswap: "uniswap",
  chainlink: "chainlink",
  litecoin: "litecoin",
  stellar: "stellar",
  "usd-coin": "usd-coin",
  dogecoin: "dogecoin",
  vechain: "vechain",
  filecoin: "filecoin",
  tron: "tron",
  eos: "eos",
  aave: "aave",
  monero: "monero",
  cosmos: "cosmos",
  tezos: "tezos",
  algorand: "algorand",
  nem: "nem",
  compound: "compound-governance-token",
  kusama: "kusama",
  zilliqa: "zilliqa",
  neo: "neo",
  sushiswap: "sushi",
  maker: "maker",
  dash: "dash",
  elrond: "elrond-erd-2",
};

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balances = await db.balance.findMany({
    where: { userId: session.user.id },
    include: { coin: true },
  });

  const prices: Record<string, number> = {};
  const host = req.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  await Promise.all(
    balances.map(async (b) => {
      const geckoId = coinToGeckoId[b.coinId.toLowerCase()];
      if (!geckoId) {
        prices[b.coinId] = 0;
        return;
      }

      const proxyUrl = `${protocol}://${host}/api/proxy/gecko/${geckoId}`;
      try {
        const res = await axios.get(proxyUrl);
        prices[b.coinId] = parseFloat(res.data.price);
      } catch (err: any) {
        console.error(
          `❌ Gecko proxy failed for ${geckoId}:`,
          err.message || err
        );
        prices[b.coinId] = 0;
      }
    })
  );

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const breakdown = balances.map((b) => {
    const amount = Number(b.amount) || 0;
    const usdValue = amount * (prices[b.coinId] || 0);
    return {
      id: b.coinId,
      name: b.coin.name,
      symbol: b.coin.symbol,
      amount,
      usdValue,
      formattedUsdValue: formatter.format(usdValue),
    };
  });

  const totalValue = breakdown.reduce((sum, c) => sum + c.usdValue, 0);

  return NextResponse.json({
    totalValue,
    formattedTotalValue: formatter.format(totalValue),
    breakdown: breakdown.map((c) => ({
      ...c,
      percentage: totalValue > 0 ? (c.usdValue / totalValue) * 100 : 0,
    })),
  });
}
