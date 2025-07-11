import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import axios from "axios";

export async function GET(req: NextRequest) {
  console.log("⚡ Cron route triggered");

  // ✅ Step 1: Auth
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    console.log("❌ Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ Step 2: Fetch all user data
  const users = await db.user.findMany();
  console.log(`👤 Found ${users.length} users`);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // ✅ Step 3: Fetch prices from your Python API
  const muntApiURL =
    "https://munt-api-production.up.railway.app/all-prices";
  let allPrices: Record<string, number> = {};

  try {
    const res = await axios.get(muntApiURL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "nextjs-cron",
      },
      timeout: 10000,
    });
    allPrices = res.data;
    console.log("📡 Prices fetched successfully");
  } catch (err: any) {
    console.error("❌ Failed to fetch from Munt API:", err.message || err);
    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Body:", err.response.data);
    }
    return NextResponse.json({ error: "Price fetch failed" }, { status: 500 });
  }

  // ✅ Step 4: Iterate through users and upsert portfolio history
  for (const user of users) {
    console.log(`➡️ User ${user.id}`);

    const balances = await db.balance.findMany({ where: { userId: user.id } });

    for (const b of balances) {
      const price = allPrices[b.coinId] ?? 0;

      if (!price || isNaN(price)) {
        console.log(`⚠️ Invalid or missing price for ${b.coinId}`);
        continue;
      }

      const usdValue = b.amount * price;
      console.log(`💵 ${b.coinId}: ${b.amount} × ${price} = ${usdValue}`);

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
        console.log(`✅ Upserted ${user.id} | ${b.coinId}`);
      } catch (upsertErr: any) {
        console.error("🔥 Upsert failed:", upsertErr.message || upsertErr);
      }
    }
  }

  console.log("🎯 Cron finished successfully");
  return NextResponse.json({ ok: true });
}
