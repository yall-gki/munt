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

  // Set the date to exact UTC midnight
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const user of users) {
    const balances = await db.balance.findMany({
      where: { userId: user.id },
      include: { coin: true },
    });

    for (const b of balances) {
      const symbol = coinToBinanceSymbol[b.coinId];
      if (!symbol) continue;

      try {
        const { data } = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
        );
        const price = parseFloat(data.price);
        const usdValue = price * b.amount;

        await db.portfolioHistory.upsert({
          where: {
            userId_coinId_date: {
              userId: user.id,
              coinId: b.coinId,
              date: today,
            },
          },
          update: {
            amount: b.amount,
            usdValue,
            name: b.coin.name,
            symbol: b.coin.symbol,
          },
          create: {
            userId: user.id,
            coinId: b.coinId,
            name: b.coin.name,
            symbol: b.coin.symbol,
            amount: b.amount,
            usdValue,
            date: today,
          },
        });
      } catch (e) {
        console.error(
          `❌ Failed for ${b.coinId}:`,
          e instanceof Error ? e.message : e
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
