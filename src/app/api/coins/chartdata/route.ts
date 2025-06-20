import { fetchCharts } from "@/lib/fetchCharts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  console.log(`🔎 Fetching chart data for coin ID: ${id}`);
  if (!id || typeof id !== "string") {
    return new Response(
      JSON.stringify({ error: "❌ Missing or invalid coin ID." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const chartData = await fetchCharts(id);
    console.log(`✅ Fetched chart data for coin ID: ${id}`);
    return new Response(JSON.stringify(chartData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ API Route Error:", error.message || error);
    return new Response(
      JSON.stringify({ error: "❌ Failed to fetch chart data." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
