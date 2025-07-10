import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

const coinToGeckoId: Record<string, string> = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  // Add more mappings as needed
};

export async function GET(req: NextRequest) {
  console.log("⚡ Cron route triggered");

  // 1. Check auth
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  console.log("🔐 Received auth:", auth);
  console.log("🔐 Expected auth:", expected);

  if (auth !== expected) {
    console.log("❌ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await db.user.findMany();
  console.log(`👤 Found ${users.length} users`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const host = req.headers.get("host")!;
  const protocol = host.includes("localhost") ? "http" : "https";

  for (const user of users) {
    console.log(`➡️ Processing user ${user.id}`);

    const balances = await db.balance.findMany({ where: { userId: user.id } });
    console.log(`💰 Found ${balances.length} balances for user ${user.id}`);

    for (const b of balances) {
      console.log(`🔄 Processing coin: ${b.coinId}`);

      const geckoId = coinToGeckoId[b.coinId];
      if (!geckoId) {
        console.log(`⚠️ No geckoId for coin ${b.coinId}, skipping`);
        continue;
      }

      const proxyUrl = `${protocol}://${host}/api/proxy/gecko/${geckoId}`;
      console.log(`🌐 Fetching price from ${proxyUrl}`);

      try {
        const res = await axios.get(proxyUrl);
        const price = parseFloat(res.data.price);
        if (isNaN(price)) {
          console.log(`❌ Invalid price from API for ${geckoId}`);
          continue;
        }

        const usdValue = b.amount * price;
        console.log(
          `📈 ${b.coinId} amount ${b.amount} × $${price} = $${usdValue}`
        );

        try {
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

          console.log(
            `✅ Upserted: ${user.id} | ${b.coinId} | ${today.toISOString()}`
          );
        } catch (upsertErr: any) {
          console.error("🔥 Upsert failed:", upsertErr.message || upsertErr);
        }
      } catch (fetchErr: any) {
        console.error(
          `❌ Failed to fetch price for ${geckoId}:`,
          fetchErr.message || fetchErr
        );
      }
    }
  }

  console.log("✅ Cron finished successfully");
  return NextResponse.json({ ok: true });
}
