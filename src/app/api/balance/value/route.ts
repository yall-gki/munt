// /app/api/balance/value/route.ts
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

// map coinId → Binance symbol (uppercase, USDT pair)
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
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const balances = await db.balance.findMany({
    where: { userId: session.user.id },
    include: { coin: true },
  });

  // Fetch all live prices
  const prices: Record<string, number> = {};
  await Promise.all(
    balances.map(async (b) => {
      const binanceSymbol = coinToBinanceSymbol[b.coinId];
      if (!binanceSymbol) return;
      try {
        const res = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
        );
        prices[b.coinId] = parseFloat(res.data.price);
      } catch {
        prices[b.coinId] = 0;
      }
    })
  );

  // Compute USD values per coin
  const coinValues = balances.map((b) => {
    const price = prices[b.coinId] ?? 0;
    const usdValue = b.amount * price;
    return {
      id: b.coinId,
      name: b.coin.name,
      symbol: b.coin.symbol,
      amount: b.amount,
      usdValue,
    };
  });

  const totalValue = coinValues.reduce((acc, c) => acc + c.usdValue, 0);

  // Add percentage field
  const pieData = coinValues.map((c) => ({
    ...c,
    percentage: totalValue > 0 ? (c.usdValue / totalValue) * 100 : 0,
  }));

  return NextResponse.json({
    totalValue,
    breakdown: pieData,
  });
}
