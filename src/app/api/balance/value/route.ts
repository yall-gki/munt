import { NextResponse } from "next/server";
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

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balances = await db.balance.findMany({
    where: { userId: session.user.id },
    include: { coin: true },
  });

  const prices: Record<string, number> = {};
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await Promise.all(
    balances.map(async (b) => {
      const coinId = b.coinId.toLowerCase();
      const symbol = coinToBinanceSymbol[coinId];

      if (!symbol) {
        prices[coinId] = 0;
        return;
      }

      try {
        const res = await axios.get(`${base}/api/proxy/binance/${symbol}`);
        prices[coinId] = parseFloat(res.data.price);
      } catch (err) {
        prices[coinId] = 0;
        console.error(`❌ Failed price for ${symbol}`, err);
      }
    })
  );

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const coinValues = balances.map((b) => {
    const coinId = b.coinId.toLowerCase();
    const amount = Number(b.amount) || 0;
    const price = prices[coinId] ?? 0;
    const usdValue = amount * price;

    return {
      id: b.coinId,
      name: b.coin.name,
      symbol: b.coin.symbol,
      amount,
      usdValue,
      formattedUsdValue: formatter.format(usdValue),
    };
  });

  const totalValueRaw = coinValues.reduce((acc, c) => acc + c.usdValue, 0);
  const totalValueFormatted = formatter.format(totalValueRaw);

  const pieData = coinValues.map((c) => ({
    ...c,
    percentage: totalValueRaw > 0 ? (c.usdValue / totalValueRaw) * 100 : 0,
  }));

  return NextResponse.json({
    totalValue: totalValueRaw,
    formattedTotalValue: totalValueFormatted,
    breakdown: pieData,
  });
}
