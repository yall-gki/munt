import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import axios from "axios";

// Map coinId → Binance symbol (uppercase, USDT pair)
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

  console.log("User balances:", balances);

  const prices: Record<string, number> = {};

  await Promise.all(
    balances.map(async (b) => {
      const coinId = b.coinId.toLowerCase();
      const binanceSymbol = coinToBinanceSymbol[coinId];

      if (!binanceSymbol) {
        console.warn(`⚠️ No Binance symbol mapping for: ${coinId}`);
        prices[coinId] = 0;
        return;
      }

      try {
        const res = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${binanceSymbol}`
        );
        prices[coinId] = parseFloat(res.data.price);
        console.log(`✅ Price fetched: ${coinId} = $${res.data.price}`);
      } catch (err) {
        console.error(`❌ Failed to fetch price for ${binanceSymbol}`, err);
        prices[coinId] = 0;
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
    const price = prices[coinId] ?? 0;
    const amount = Number(b.amount) || 0;
    const usdValue = amount * price;

    console.log(
      `🧮 ${coinId}: amount=${amount}, price=${price}, value=$${usdValue}`
    );

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

  console.log("✅ Total USD value:", totalValueRaw);

  return NextResponse.json({
    totalValue: totalValueRaw,
    formattedTotalValue: totalValueFormatted,
    breakdown: pieData,
  });
}
