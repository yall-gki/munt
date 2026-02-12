import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";

type SnapshotSeriesPoint = {
  date: string;
  value: number;
};

const toRoi = (current: number, previous: number | undefined) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = Math.min(Math.max(Number(limitParam) || 90, 1), 365);

  const rows = await db.snapshot.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: limit,
  });

  const snapshots = rows.reverse();
  const portfolioSeries: SnapshotSeriesPoint[] = snapshots.map((snap) => ({
    date: snap.date.toISOString(),
    value: snap.portfolioValue,
  }));

  const dailyRoi = snapshots.map((snap, idx) => ({
    date: snap.date.toISOString(),
    value: idx === 0 ? 0 : toRoi(snap.portfolioValue, snapshots[idx - 1]?.portfolioValue),
  }));

  const weeklyRoi = snapshots.map((snap, idx) => ({
    date: snap.date.toISOString(),
    value: idx < 7 ? 0 : toRoi(snap.portfolioValue, snapshots[idx - 7]?.portfolioValue),
  }));

  const monthlyRoi = snapshots.map((snap, idx) => ({
    date: snap.date.toISOString(),
    value: idx < 30 ? 0 : toRoi(snap.portfolioValue, snapshots[idx - 30]?.portfolioValue),
  }));

  const base = snapshots[0]?.portfolioValue;
  const cumulativeRoi = snapshots.map((snap) => ({
    date: snap.date.toISOString(),
    value: base ? toRoi(snap.portfolioValue, base) : 0,
  }));

  const latest = snapshots[snapshots.length - 1] ?? null;

  return NextResponse.json({
    snapshots,
    series: {
      portfolio: portfolioSeries,
      dailyRoi,
      weeklyRoi,
      monthlyRoi,
      cumulativeRoi,
    },
    latest,
  });
}
