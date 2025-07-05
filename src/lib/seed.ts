import { db } from "./db.cli";

const staticCoins = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH" },
  { id: "binancecoin", name: "BNB", symbol: "BNB" },
  { id: "cardano", name: "Cardano", symbol: "ADA" },
  { id: "ripple", name: "XRP", symbol: "XRP" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT" },
  { id: "uniswap", name: "Uniswap", symbol: "UNI" },
  { id: "chainlink", name: "Chainlink", symbol: "LINK" },
  { id: "litecoin", name: "Litecoin", symbol: "LTC" },
  { id: "stellar", name: "Stellar", symbol: "XLM" },
  { id: "usd-coin", name: "USD Coin", symbol: "USDC" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
  { id: "vechain", name: "VeChain", symbol: "VET" },
  { id: "filecoin", name: "Filecoin", symbol: "FIL" },
  { id: "tron", name: "TRON", symbol: "TRX" },
  { id: "eos", name: "EOS", symbol: "EOS" },
  { id: "aave", name: "Aave", symbol: "AAVE" },
  { id: "monero", name: "Monero", symbol: "XMR" },
  { id: "cosmos", name: "Cosmos", symbol: "ATOM" },
  { id: "tezos", name: "Tezos", symbol: "XTZ" },
  { id: "algorand", name: "Algorand", symbol: "ALGO" },
  { id: "nem", name: "NEM", symbol: "XEM" },
  { id: "compound", name: "Compound", symbol: "COMP" },
  { id: "kusama", name: "Kusama", symbol: "KSM" },
  { id: "zilliqa", name: "Zilliqa", symbol: "ZIL" },
  { id: "neo", name: "NEO", symbol: "NEO" },
  { id: "sushiswap", name: "SushiSwap", symbol: "SUSHI" },
  { id: "maker", name: "Maker", symbol: "MKR" },
  { id: "dash", name: "Dash", symbol: "DASH" },
  { id: "elrond", name: "MultiversX", symbol: "EGLD" },
];

async function seed() {
  for (const coin of staticCoins) {
    await db.coin.upsert({
      where: { id: coin.id },
      update: {},
      create: {
        ...coin,
        image: null, // or use `/icons/${coin.id}.png` if you want local icons
      },
    });
    console.log(`✅ Seeded: ${coin.name}`);
  }

  console.log("🌱 All coins seeded without CoinGecko drama.");
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
