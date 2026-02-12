"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronDown, Wallet, Sparkles, Activity, Layers, Loader2 } from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import ExecutedTradesLog from "@/components/ExecutedTradesLog";

ChartJS.register(
  BarElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

type CoinBalance = {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  amount: number;
  usdValue: number;
  percentage: number;
};

type Snapshot = {
  id: string;
  date: string;
  portfolioValue: number;
  perCoinValue: Record<string, number>;
  realizedPL: number;
  unrealizedPL: number;
};

type SnapshotSeriesPoint = {
  date: string;
  value: number;
};

type SnapshotSeries = {
  portfolio: SnapshotSeriesPoint[];
  dailyRoi: SnapshotSeriesPoint[];
  weeklyRoi: SnapshotSeriesPoint[];
  monthlyRoi: SnapshotSeriesPoint[];
  cumulativeRoi: SnapshotSeriesPoint[];
};

type WalletData = {
  totalValue: number;
  breakdown: CoinBalance[];
};

type StrategyPerformance = {
  id: string;
  name: string;
  type: string;
  coinId: string | null;
  timeframe: string | null;
  isActive: boolean;
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolumeUsd: number;
  lastTradeAt: string | null;
};

type StrategyTrade = {
  id: string;
  amount: number;
  entryPrice: number;
  executedAt: string;
  strategy?: { id: string; name: string };
  coin?: { symbol: string };
};

const chartPalette = [
  "#38BDF8",
  "#22D3EE",
  "#34D399",
  "#A3E635",
  "#FBBF24",
  "#F472B6",
  "#A78BFA",
  "#60A5FA",
  "#F87171",
  "#94A3B8",
];

const chartBorderColor = "rgba(15, 23, 42, 0.8)";
const chartGridColor = "rgba(148, 163, 184, 0.12)";
const chartTickColor = "#94A3B8";

type CategoryKey =
  | "roi"
  | "pnl"
  | "rebalancing"
  | "dca"
  | "staking"
  | "whatif";

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("roi");
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [snapshotSeries, setSnapshotSeries] = useState<SnapshotSeries | null>(
    null
  );
  const [snapshotLoading, setSnapshotLoading] = useState(true);
  const [dcaCoinId, setDcaCoinId] = useState("");
  const [dcaAmount, setDcaAmount] = useState(50);
  const [dcaInterval, setDcaInterval] = useState(7);
  const [dcaDays, setDcaDays] = useState(90);
  const [dcaPriceSeries, setDcaPriceSeries] = useState<
    { time: number; close: number }[]
  >([]);
  const [dcaLoading, setDcaLoading] = useState(false);
  const [whatIfCoinId, setWhatIfCoinId] = useState("");
  const [whatIfInitial, setWhatIfInitial] = useState(1000);
  const [whatIfDays, setWhatIfDays] = useState(180);
  const [whatIfPriceSeries, setWhatIfPriceSeries] = useState<
    { time: number; close: number }[]
  >([]);
  const [whatIfLoading, setWhatIfLoading] = useState(false);
  const [stakingApr, setStakingApr] = useState(6);
  const [stakingDays, setStakingDays] = useState(180);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyPerformance, setStrategyPerformance] = useState<StrategyPerformance[]>([]);
  const [strategyTrades, setStrategyTrades] = useState<StrategyTrade[]>([]);
  const [strategyLoading, setStrategyLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const res = await axios.get("/api/auth/verify");
        if (!active) return;
        if (res.data?.authorized) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace("/login");
        }
      } catch {
        if (!active) return;
        setIsAuthorized(false);
        router.replace("/login");
      }
    };

    verifySession();
    return () => {
      active = false;
    };
  }, [router]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      await axios.post("/api/generate");

      const res = await axios.get("/api/balance/value");
      res.data.breakdown.sort((a: any, b: any) => b.usdValue - a.usdValue);
      setData(res.data);

      if (res.data.breakdown.length) {
        const first = res.data.breakdown[0].id;
        setDcaCoinId((prev) => (prev ? prev : first));
        setWhatIfCoinId((prev) => (prev ? prev : first));
      }
    } catch (error) {
      console.error("Failed to generate balances", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  useEffect(() => {
    if (isAuthorized !== true) return;
    axios
      .get("/api/balance/value")
      .then((res) => {
        res.data.breakdown.sort((a: any, b: any) => b.usdValue - a.usdValue);
        setData(res.data);
        console.log(res.data);

        if (res.data.breakdown.length) {
          const first = res.data.breakdown[0].id;
          setDcaCoinId((prev) => (prev ? prev : first));
          setWhatIfCoinId((prev) => (prev ? prev : first));
        }
      })
      .catch((error) => {
        console.error("Failed to load balances", error);
        setData({ totalValue: 0, breakdown: [] });
      });
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized !== true) return;
    const fetchStrategies = async () => {
      setStrategyLoading(true);
      try {
        const [perfRes, tradesRes] = await Promise.all([
          axios.get("/api/strategies/performance"),
          axios.get("/api/strategies/trades"),
        ]);
        setStrategyPerformance(perfRes.data?.performance ?? []);
        setStrategyTrades(tradesRes.data?.trades ?? []);
      } catch (error) {
        console.error("Failed to load strategy analytics", error);
      } finally {
        setStrategyLoading(false);
      }
    };

    fetchStrategies();
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized !== true) return;
    const fetchSnapshots = async () => {
      setSnapshotLoading(true);
      try {
        const res = await axios.get("/api/snapshots?limit=120");
        setSnapshots(res.data?.snapshots ?? []);
        setSnapshotSeries(res.data?.series ?? null);
      } catch (error) {
        console.error("Failed to load snapshots", error);
        setSnapshots([]);
        setSnapshotSeries(null);
      } finally {
        setSnapshotLoading(false);
      }
    };
    fetchSnapshots();
  }, [isAuthorized]);


  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const listener = () => setIsSmallScreen(mq.matches);
    listener();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const coins = data?.breakdown || [];
  const chartColorsUsed = coins.map(
    (_coin, index) => chartPalette[index % chartPalette.length]
  );
  const coinLabels = coins.map((c) => c.symbol.toUpperCase());

  const latestSnapshot = snapshots[snapshots.length - 1] ?? null;
  const prevSnapshot =
    snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  useEffect(() => {
    if (!dcaCoinId && coins.length > 0) {
      setDcaCoinId(coins[0].id);
    }
    if (!whatIfCoinId && coins.length > 0) {
      setWhatIfCoinId(coins[0].id);
    }
  }, [coins, dcaCoinId, whatIfCoinId]);

  useEffect(() => {
    if (!dcaCoinId) return;
    const coin = coins.find((c) => c.id === dcaCoinId);
    if (!coin) return;
    const fetchDca = async () => {
      setDcaLoading(true);
      try {
        const res = await axios.get(
          `/api/coins/chartdata?id=${dcaCoinId}&symbol=${coin.symbol}&interval=1d&days=${dcaDays}`
        );
        setDcaPriceSeries(res.data ?? []);
      } catch (error) {
        console.error("Failed to load DCA chart data", error);
        setDcaPriceSeries([]);
      } finally {
        setDcaLoading(false);
      }
    };
    fetchDca();
  }, [dcaCoinId, dcaDays, coins]);

  useEffect(() => {
    if (!whatIfCoinId) return;
    const coin = coins.find((c) => c.id === whatIfCoinId);
    if (!coin) return;
    const fetchWhatIf = async () => {
      setWhatIfLoading(true);
      try {
        const res = await axios.get(
          `/api/coins/chartdata?id=${whatIfCoinId}&symbol=${coin.symbol}&interval=1d&days=${whatIfDays}`
        );
        setWhatIfPriceSeries(res.data ?? []);
      } catch (error) {
        console.error("Failed to load simulation chart data", error);
        setWhatIfPriceSeries([]);
      } finally {
        setWhatIfLoading(false);
      }
    };
    fetchWhatIf();
  }, [whatIfCoinId, whatIfDays, coins]);

  const roiData = useMemo(() => {
    if (!snapshotSeries) return null;
    const labels = snapshotSeries.dailyRoi.map((point) =>
      new Date(point.date).toLocaleDateString("en-US")
    );
    return {
      labels,
      datasets: [
        {
          label: "Daily",
          data: snapshotSeries.dailyRoi.map((p) => p.value),
          borderColor: "#38BDF8",
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Weekly",
          data: snapshotSeries.weeklyRoi.map((p) => p.value),
          borderColor: "#A78BFA",
          backgroundColor: "rgba(167, 139, 250, 0.08)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Monthly",
          data: snapshotSeries.monthlyRoi.map((p) => p.value),
          borderColor: "#34D399",
          backgroundColor: "rgba(52, 211, 153, 0.08)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Cumulative",
          data: snapshotSeries.cumulativeRoi.map((p) => p.value),
          borderColor: "#FBBF24",
          backgroundColor: "rgba(251, 191, 36, 0.08)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    };
  }, [snapshotSeries]);

  const pnlData = useMemo(() => {
    const latest = latestSnapshot?.perCoinValue ?? {};
    const previous = prevSnapshot?.perCoinValue ?? {};
    const deltas = coins.map(
      (coin) => (latest[coin.id] ?? 0) - (previous[coin.id] ?? 0)
    );
    const colors = deltas.map((v) =>
      v >= 0 ? "rgba(34, 211, 153, 0.7)" : "rgba(248, 113, 113, 0.7)"
    );
    return {
      labels: coinLabels,
      datasets: [
        {
          label: "Daily P/L",
          data: deltas,
          backgroundColor: colors,
          borderRadius: 6,
        },
      ],
    };
  }, [coins, coinLabels, latestSnapshot, prevSnapshot]);

  const rebalanceData = useMemo(() => {
    const total = latestSnapshot?.portfolioValue ?? 0;
    const actual = coins.map((coin) =>
      total > 0 ? ((latestSnapshot?.perCoinValue?.[coin.id] ?? 0) / total) * 100 : 0
    );
    const target = coins.length > 0 ? 100 / coins.length : 0;
    return {
      labels: coinLabels,
      datasets: [
        {
          label: "Actual %",
          data: actual,
          backgroundColor: "rgba(56, 189, 248, 0.6)",
          borderRadius: 6,
        },
        {
          label: "Target %",
          data: coins.map(() => target),
          backgroundColor: "rgba(148, 163, 184, 0.4)",
          borderRadius: 6,
        },
      ],
    };
  }, [coins, coinLabels, latestSnapshot]);

  const dcaChartData = useMemo(() => {
    if (dcaPriceSeries.length === 0) return null;
    let totalCoins = 0;
    let invested = 0;
    const interval = Math.max(1, dcaInterval);
    const series = dcaPriceSeries.map((point, idx) => {
      if (idx % interval === 0) {
        invested += dcaAmount;
        totalCoins += dcaAmount / point.close;
      }
      return {
        date: new Date(point.time * 1000).toISOString(),
        value: totalCoins * point.close,
        invested,
      };
    });
    return {
      labels: series.map((p) => new Date(p.date).toLocaleDateString("en-US")),
      datasets: [
        {
          label: "Portfolio Value",
          data: series.map((p) => p.value),
          borderColor: "#38BDF8",
          backgroundColor: "rgba(56, 189, 248, 0.1)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
        {
          label: "Invested",
          data: series.map((p) => p.invested),
          borderColor: "#94A3B8",
          backgroundColor: "rgba(148, 163, 184, 0.08)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    };
  }, [dcaPriceSeries, dcaAmount, dcaInterval]);

  const whatIfChartData = useMemo(() => {
    if (whatIfPriceSeries.length === 0) return null;
    const initialPrice = whatIfPriceSeries[0]?.close ?? 0;
    if (!initialPrice) return null;
    const coinsBought = whatIfInitial / initialPrice;
    const series = whatIfPriceSeries.map((point) => ({
      date: new Date(point.time * 1000).toISOString(),
      value: coinsBought * point.close,
    }));
    return {
      labels: series.map((p) => new Date(p.date).toLocaleDateString("en-US")),
      datasets: [
        {
          label: "Simulated Value",
          data: series.map((p) => p.value),
          borderColor: "#F472B6",
          backgroundColor: "rgba(244, 114, 182, 0.12)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    };
  }, [whatIfPriceSeries, whatIfInitial]);

  const stakingSeries = useMemo(() => {
    const base = latestSnapshot?.portfolioValue ?? 0;
    if (!base || stakingDays <= 0) return [];
    const dailyRate = stakingApr / 100 / 365;
    let value = base;
    return Array.from({ length: stakingDays }, (_, idx) => {
      value = value * (1 + dailyRate);
      const date = new Date();
      date.setDate(date.getDate() + idx);
      return { date: date.toISOString(), value };
    });
  }, [latestSnapshot, stakingApr, stakingDays]);

  const stakingChartData = useMemo(() => {
    if (stakingSeries.length === 0) return null;
    return {
      labels: stakingSeries.map((p) => new Date(p.date).toLocaleDateString("en-US")),
      datasets: [
        {
          label: "Projected Value",
          data: stakingSeries.map((p) => p.value),
          borderColor: "#22D3EE",
          backgroundColor: "rgba(34, 211, 238, 0.12)",
          borderWidth: 2,
          tension: 0.35,
          pointRadius: 0,
        },
      ],
    };
  }, [stakingSeries]);

  const barData = {
    labels: coinLabels,
    datasets: [
      {
        label: "Holdings",
        data: coins.map((c) => c.amount || 0),
        backgroundColor: chartColorsUsed,
        borderColor: chartBorderColor,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const tradesByStrategy = useMemo(() => {
    const map = new Map<string, StrategyTrade[]>();
    for (const trade of strategyTrades) {
      const strategyId = trade.strategy?.id;
      if (!strategyId) continue;
      const list = map.get(strategyId) ?? [];
      list.push(trade);
      map.set(strategyId, list);
    }
    return map;
  }, [strategyTrades]);

  const categories = [
    { key: "roi", label: "ROI Charts", description: "Daily, weekly, monthly, cumulative" },
    { key: "pnl", label: "P/L Breakdown", description: "Per-coin daily profit & loss" },
    { key: "rebalancing", label: "Rebalancing", description: "Actual vs target allocations" },
    { key: "dca", label: "DCA Simulation", description: "Recurring buys over time" },
    { key: "staking", label: "Staking/Yield", description: "Yield projection on holdings" },
    { key: "whatif", label: "What-if Simulation", description: "Historical single-buy scenario" },
  ] as const;

  const chartLineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: chartTickColor } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
    },
  };

  const chartValueOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: chartTickColor } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => currencyFormatter.format(ctx.raw as number),
        },
      },
    },
    scales: {
      x: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
    },
  };

  const chartPercentOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, labels: { color: chartTickColor } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.raw.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
      y: { ticks: { color: chartTickColor }, grid: { color: chartGridColor } },
    },
  };

  const categoryViews: Record<CategoryKey, JSX.Element> = {
    roi: (
      <div className="h-full">
        {snapshotLoading ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-400">
            Loading ROI data...
          </div>
        ) : !roiData ? (
          <div className="h-full flex items-center justify-center text-sm text-zinc-400">
            No ROI data available.
          </div>
        ) : (
          <Line data={roiData} options={chartLineOptions} />
        )}
      </div>
    ),
    pnl: (
      <div className="h-full">
        <Bar data={pnlData} options={chartValueOptions} />
      </div>
    ),
    rebalancing: (
      <div className="h-full space-y-3">
        <div className="text-xs text-zinc-400">
          Targets default to equal weight. Adjust in strategy settings for custom
          allocations.
        </div>
        <div className="h-[260px]">
          <Bar data={rebalanceData} options={chartPercentOptions} />
        </div>
      </div>
    ),
    dca: (
      <div className="h-full space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400">Coin</label>
            <select
              value={dcaCoinId}
              onChange={(e) => setDcaCoinId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Amount (USD)</label>
            <input
              type="number"
              min="1"
              value={dcaAmount}
              onChange={(e) => setDcaAmount(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Interval (days)</label>
            <input
              type="number"
              min="1"
              value={dcaInterval}
              onChange={(e) => setDcaInterval(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Lookback (days)</label>
            <input
              type="number"
              min="7"
              value={dcaDays}
              onChange={(e) => setDcaDays(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
        </div>
        <div className="h-[260px]">
          {dcaLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              Loading DCA simulation...
            </div>
          ) : !dcaChartData ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              DCA data not available.
            </div>
          ) : (
            <Line data={dcaChartData} options={chartValueOptions} />
          )}
        </div>
      </div>
    ),
    staking: (
      <div className="h-full space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400">APR (%)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={stakingApr}
              onChange={(e) => setStakingApr(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Projection (days)</label>
            <input
              type="number"
              min="30"
              value={stakingDays}
              onChange={(e) => setStakingDays(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Base Value</label>
            <div className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700">
              {currencyFormatter.format(latestSnapshot?.portfolioValue || 0)}
            </div>
          </div>
        </div>
        <div className="h-[260px]">
          {!stakingChartData ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              Staking projection unavailable.
            </div>
          ) : (
            <Line data={stakingChartData} options={chartValueOptions} />
          )}
        </div>
      </div>
    ),
    whatif: (
      <div className="h-full space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="space-y-1">
            <label className="text-zinc-400">Coin</label>
            <select
              value={whatIfCoinId}
              onChange={(e) => setWhatIfCoinId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Initial (USD)</label>
            <input
              type="number"
              min="1"
              value={whatIfInitial}
              onChange={(e) => setWhatIfInitial(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Lookback (days)</label>
            <input
              type="number"
              min="30"
              value={whatIfDays}
              onChange={(e) => setWhatIfDays(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-2 py-1"
            />
          </div>
          <div className="space-y-1">
            <label className="text-zinc-400">Current Value</label>
            <div className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700">
              {whatIfChartData?.datasets?.[0]?.data?.length
                ? currencyFormatter.format(
                    whatIfChartData.datasets[0].data.slice(-1)[0] as number
                  )
                : "--"}
            </div>
          </div>
        </div>
        <div className="h-[260px]">
          {whatIfLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              Loading simulation...
            </div>
          ) : !whatIfChartData ? (
            <div className="h-full flex items-center justify-center text-sm text-zinc-400">
              Simulation data unavailable.
            </div>
          ) : (
            <Line data={whatIfChartData} options={chartValueOptions} />
          )}
        </div>
      </div>
    ),
  };

  if (isAuthorized !== true || !data) {
    return (
      <div className="min-h-full bg-black text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-black text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid gap-4 md:grid-cols-[320px_1fr]">
          <div className="bg-zinc-950 rounded-xl overflow-hidden">
            {isSmallScreen && (
              <button
                onClick={() => setCollapsed((p) => !p)}
                className="w-full px-4 py-3 flex justify-between items-center bg-zinc-800 border-b border-zinc-700"
              >
                <span className="text-xl font-bold">Your Balances</span>
                <motion.div
                  animate={{ rotate: collapsed ? 0 : 180 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
            )}
            {(!isSmallScreen || !collapsed) && (
              <div className="px-4 py-4 space-y-3 overflow-y-auto max-h-[70vh] scrollbar-thin scrollbar-thumb-zinc-800">
                {!isSmallScreen && (
                  <p className="text-xl font-bold mb-2">Your Balances</p>
                )}
                {coins.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    No balances yet. Generate demo balances to get started.
                  </p>
                ) : (
                  coins.map((c) => (
                    <CoinItem
                      key={c.id}
                      coin={c}
                      currencyFormatter={currencyFormatter}
                    />
                  ))
                )}
              </div>
            )}
          </div>

          <div className="bg-zinc-950 rounded-xl px-6 py-6 flex flex-col gap-6 items-center">
            <div className="w-full flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-xl font-bold">Total Value</h2>
                <p className="text-4xl font-extrabold text-blue-500">
                  {currencyFormatter.format(data?.totalValue || 0)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition shadow-[0_0_14px_rgba(59,130,246,0.45)]">
                  <Wallet className="w-4 h-4" /> Connect Wallet
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="p-2 rounded-lg bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 disabled:opacity-50 flex items-center justify-center"
                  aria-label="Generate demo balances"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`snap-start px-3 py-1 text-sm font-medium rounded-full transition whitespace-nowrap ${
                      activeCategory === cat.key
                        ? "bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                    {categories.find((c) => c.key === activeCategory)?.label}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {categories.find((c) => c.key === activeCategory)?.description}
                  </p>
                </div>
                <div className="relative h-[320px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCategory}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.25 }}
                      className="h-full w-full"
                    >
                      {categoryViews[activeCategory]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-zinc-950 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-400" />
              <h3 className="text-lg font-semibold">Holdings Per Coin</h3>
            </div>
            <div className="h-64">
              <Bar
                data={barData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      ticks: { color: chartTickColor },
                      grid: { color: chartGridColor },
                    },
                    y: {
                      ticks: { color: chartTickColor },
                      grid: { color: chartGridColor },
                    },
                  },
                }}
              />
            </div>
            <div className="pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-blue-400" />
                <h3 className="text-lg font-semibold">Transaction History</h3>
              </div>
              <ExecutedTradesLog refreshKey={0} />
            </div>
          </div>

          <div className="bg-zinc-950 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-300" />
              <h3 className="text-lg font-semibold">Strategy Performance</h3>
            </div>
            {strategyLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              </div>
            ) : strategyPerformance.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No strategies yet. Create one from a coin chart to see analytics.
              </p>
            ) : (
              <div className="space-y-4">
                {strategyPerformance.map((strategy) => {
                  const trades = tradesByStrategy.get(strategy.id) || [];
                  return (
                    <div
                      key={strategy.id}
                      className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{strategy.name}</p>
                          <p className="text-xs text-zinc-400">
                            {strategy.type} • {strategy.timeframe || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            strategy.isActive
                              ? "bg-blue-500/20 text-blue-200"
                              : "bg-zinc-700 text-zinc-300"
                          }`}
                        >
                          {strategy.isActive ? "Active" : "Paused"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                        <span>Total trades: {strategy.totalTrades}</span>
                        <span>
                          Volume: $
                          {strategy.totalVolumeUsd.toFixed(2)}
                        </span>
                        <span>Buys: {strategy.buyTrades}</span>
                        <span>Sells: {strategy.sellTrades}</span>
                      </div>
                      {trades.length > 0 && (
                        <div className="border-t border-zinc-800 pt-3">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
                            Recent trades
                          </p>
                          <div className="space-y-2 text-xs text-zinc-300">
                            {trades.slice(0, 3).map((trade) => (
                              <div
                                key={trade.id}
                                className="flex items-center justify-between"
                              >
                                <span>
                                  {trade.amount < 0 ? "Sell" : "Buy"}{" "}
                                  {trade.coin?.symbol?.toUpperCase() || ""}
                                </span>
                                <span>
                                  {new Date(trade.executedAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CoinItem({
  coin,
  currencyFormatter,
}: {
  coin: CoinBalance;
  currencyFormatter: Intl.NumberFormat;
}) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg bg-zinc-900">
      <Image
        src={
          coin.image ||
          `https://cryptoicon-api.pages.dev/api/icon/${coin.symbol.toLowerCase()}`
        }
        alt={coin.name}
        width={24}
        height={24}
        className="w-6 h-6 object-contain rounded-full"
        onError={(e) =>
          (e.currentTarget.src = "https://via.placeholder.com/24")
        }
        unoptimized
      />
      <div className="flex-1 ml-3">
        <p className="font-semibold">
          {coin.name} ({coin.symbol.toUpperCase()})
        </p>
        <p className="text-sm text-zinc-400">
          {coin.amount} • {currencyFormatter.format(coin.usdValue)}
        </p>
      </div>
      <span className="text-sm text-zinc-400 whitespace-nowrap">
        {coin.percentage > 0 ? `${coin.percentage.toFixed(1)}%` : "-"}
      </span>
    </div>
  );
}
