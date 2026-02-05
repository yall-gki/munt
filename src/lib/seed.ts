import { db } from "./db.cli.ts";
import { coinCatalog } from "./coinCatalog";

async function seed() {
  for (const coin of coinCatalog) {
    await db.coin.upsert({
      where: { id: coin.id },
      update: {},
      create: {
        ...coin,
        image: coin.image ?? null, // or use `/icons/${coin.id}.png` if you want local icons
      },
    });
    console.log(`✅ Seeded: ${coin.name}`);
  }

  console.log("🌱 All coins seeded without CoinGecko drama.");
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
