// app/api/coins/fetchcoins/route.ts
import { fetchCoins } from "@/lib/fetchCoins";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",") ?? [];

  if (ids.length === 0) {
    return new Response(JSON.stringify({ error: "Missing IDs" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const data = await fetchCoins(ids);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("❌ API error:", e.message);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
