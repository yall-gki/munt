import { fetchCharts } from "@/lib/fetchCharts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const symbol = searchParams.get("symbol") || undefined;
  const interval = searchParams.get("interval") || undefined;
  const daysParam = searchParams.get("days");
  const days = daysParam ? Number(daysParam) : undefined;

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
    const chartData = await fetchCharts(id, {
      symbol,
      interval,
      days: Number.isFinite(days) ? days : undefined,
    });
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
