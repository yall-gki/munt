import { NextResponse } from "next/server";
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
  const users = await db.user.findMany();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  for (const user of users) {
    const balances = await db.balance.findMany({
      where: { userId: user.id },
    });

    for (const b of balances) {
      const symbol = coinToBinanceSymbol[b.coinId];
      if (!symbol) continue;

      try {
        const res = await axios.get(`${base}/api/proxy/binance/${symbol}`);
        const price = parseFloat(res.data.price);
        const usdValue = b.amount * price;

        await db.portfolioHistory.upsert({
          where: {
            userId_coinId_date: {
              userId: user.id,
              coinId: b.coinId,
              date: today,
            },
          },
          update: { usdValue },
          create: {
            userId: user.id,
            coinId: b.coinId,
            date: today,
            usdValue,
          },
        });
      } catch (err) {
        console.error(`Failed log for ${symbol}`, err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
