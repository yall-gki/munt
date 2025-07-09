import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

// Map your coin IDs to CoinGecko IDs
const coinToGeckoId: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  // …etc
};

export async function GET(req: NextRequest) {
  // 1️⃣ Verify cron secret
  const auth = req.headers.get("authorization") || "";
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const host = req.headers.get("host")!;
  const protocol = host.includes("localhost") ? "http" : "https";

  for (const user of users) {
    const balances = await db.balance.findMany({ where: { userId: user.id } });
    for (const b of balances) {
      const geckoId = coinToGeckoId[b.coinId];
      if (!geckoId) continue;

      try {
        // 2️⃣ Fetch via your Gecko proxy
        const proxyUrl = `${protocol}://${host}/api/proxy/gecko/${geckoId}`;
        const res = await axios.get(proxyUrl);
        const price = parseFloat(res.data.price);
        const usdValue = b.amount * price;

        // 3️⃣ Upsert into portfolioHistory
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
      } catch (err: any) {
        console.error(`❌ Failed log for ${geckoId}:`, err.message || err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
