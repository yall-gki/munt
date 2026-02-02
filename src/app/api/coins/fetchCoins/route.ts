import { fetchCoins } from "@/lib/fetchCoins";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids")?.split(",") ?? [];

  if (ids.length === 0) {
    return new Response(JSON.stringify({ data: null, error: "Missing IDs" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    console.log("Fetching coins for IDs:", ids);
    const data = await fetchCoins(ids);
    return new Response(JSON.stringify({ data, error: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(JSON.stringify({ data: null, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
