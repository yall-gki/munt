import type { NextApiRequest, NextApiResponse } from "next";
import { fetchCharts } from "@/lib/fetchCharts"; // make sure the path is correct

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "❌ Missing or invalid coin ID." });
  }

  try {
    const chartData = await fetchCharts(id);
    return res.status(200).json(chartData);
  } catch (error: any) {
    console.error("❌ API Route Error:", error.message || error);
    return res.status(500).json({ error: "❌ Failed to fetch chart data." });
  }
}
