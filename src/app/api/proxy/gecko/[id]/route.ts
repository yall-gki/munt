// src/app/api/proxy/gecko/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const id = parts[parts.length - 1]?.toLowerCase();

  if (!id) {
    return NextResponse.json({ error: "Missing coin id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(
        id
      )}&vs_currencies=usd`
    );
    if (!res.ok) throw new Error(`Gecko error ${res.status}`);
    const data = await res.json();
    if (!data[id]?.usd) {
      return NextResponse.json(
        { error: "Unsupported coin id", detail: data },
        { status: 400 }
      );
    }
    return NextResponse.json({ price: data[id].usd });
  } catch (error: any) {
    console.error(`Gecko proxy error for ${id}:`, error.message);
    return NextResponse.json(
      { error: "Failed to fetch from CoinGecko", detail: error.message },
      { status: 500 }
    );
  }
}
