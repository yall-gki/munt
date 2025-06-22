import { NextResponse } from "next/server";

export async function GET() {
  const ids = [
    "bitcoin",
    "ethereum",
    "binancecoin",
    "cardano",
    "xrp",
    "polkadot",
    "uniswap",
    "chainlink",
    "litecoin",
    "stellar",
    "usdc",
    "dogecoin",
    "vechain",
    "filecoin",
    "tron",
    "eos",
    "aave",
    "monero",
    "cosmos",
    "tezos",
    "algorand",
    "nem",
    "compound",
    "kusama",
    "zilliqa",
    "neo",
    "sushiswap",
    "maker",
    "dash",
    "elrond",
  ];

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(
        ","
      )}&sparkline=true`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 0 },
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("CoinGecko fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
