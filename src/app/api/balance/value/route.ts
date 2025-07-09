import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

const coinToBinanceSymbol: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  binancecoin: "BNBUSDT",
  cardano: "ADAUSDT",
  ripple: "XRPUSDT",
  polkadot: "DOTUSDT",
  uniswap: "UNIUSDT",
  chainlink: "LINKUSDT",
  litecoin: "LTCUSDT",
  stellar: "XLMUSDT",
  "usd-coin": "USDCUSDT",
  dogecoin: "DOGEUSDT",
  vechain: "VETUSDT",
  filecoin: "FILUSDT",
  tron: "TRXUSDT",
  eos: "EOSUSDT",
  aave: "AAVEUSDT",
  monero: "XMRUSDT",
  cosmos: "ATOMUSDT",
  tezos: "XTZUSDT",
  algorand: "ALGOUSDT",
  nem: "XEMUSDT",
  compound: "COMPUSDT",
  kusama: "KSMUSDT",
  zilliqa: "ZILUSDT",
  neo: "NEOUSDT",
  sushiswap: "SUSHIUSDT",
  maker: "MKRUSDT",
  dash: "DASHUSDT",
  elrond: "EGLDUSDT",
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
      const symbol = coinToBinanceSymbol[b.coinId.toLowerCase()];
      if (!symbol) {
        prices[b.coinId] = 0;
        return;
      }

      const proxyUrl = `${protocol}://${host}/api/proxy/binance/${symbol}`;

      try {
        const res = await axios.get(proxyUrl);
        prices[b.coinId] = parseFloat(res.data.price);
      } catch (err: any) {
        console.error(
          `❌ Proxy fetch failed for ${symbol}:`,
          err?.message || err
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
