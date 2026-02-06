"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronDown, Wallet, Sparkles, Activity, Layers, Loader2 } from "lucide-react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
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
  ArcElement,
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

type HistoryPoint = {
  date: string;
  value: number;
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

const chartAccent = "#38BDF8";
const chartAccentFill = "rgba(56, 189, 248, 0.18)";
const chartBorderColor = "rgba(15, 23, 42, 0.8)";
const chartGridColor = "rgba(148, 163, 184, 0.12)";
const chartTickColor = "#94A3B8";

const chartModes = ["Doughnut", "Line", "Area"] as const;
type ChartMode = (typeof chartModes)[number];

export default function Page() {
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mode, setMode] = useState<ChartMode>("Doughnut");
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
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
        setSelectedCoin(res.data.breakdown[0].id);
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

  const gainLoss =
    history?.length >= 2
      ? ((history.at(-1)!.value - history[0].value) / history[0].value) * 100
      : 0;

  useEffect(() => {
    if (isAuthorized !== true) return;
    axios
      .get("/api/balance/value")
      .then((res) => {
        res.data.breakdown.sort((a: any, b: any) => b.usdValue - a.usdValue);
        setData(res.data);
        console.log(res.data);

        if (res.data.breakdown.length) {
          setSelectedCoin(res.data.breakdown[0].id);
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
    if (isAuthorized !== true || !selectedCoin) return;
    axios
      .get(`/api/portfolio/history/${selectedCoin}`)
      .then((res) => setHistory(res.data));
  }, [isAuthorized, selectedCoin]);

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
  const usdValues = coins.map((c) => c.usdValue || 0);
  const coinLabels = coins.map((c) => c.symbol.toUpperCase());
  const allZero = usdValues.every((v) => v === 0);
  const displayValues = allZero
    ? usdValues.map((v, i) => (i === 0 ? 0.00001 : 0))
    : usdValues;

  const doughnutData = {
    labels: coinLabels,
    datasets: [
      {
        data: displayValues,
        backgroundColor: chartColorsUsed,
        borderWidth: 3,
        borderColor: chartBorderColor,
        hoverBorderColor: chartAccent,
        hoverOffset: 12,
        spacing: 2,
      },
    ],
  };

  const lineData = {
    labels: history.map((h) => new Date(h.date).toLocaleDateString("en-US")),
    datasets: [
      {
        data: history.map((h) => h.value),
        backgroundColor:
          mode === "Area" ? chartAccentFill : "transparent",
        borderColor: chartAccent,
        pointBackgroundColor: chartAccent,
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 2,
        tension: 0.4,
        fill: mode === "Area",
      },
    ],
  };

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

            <div className="w-full flex flex-wrap gap-3 items-center">
              {chartModes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 text-sm font-medium rounded-full transition ${
                    mode === m
                      ? "bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {m}
                </button>
              ))}
              {(mode === "Line" || mode === "Area") && (
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="px-3 py-1 bg-zinc-800 rounded-lg text-white"
                >
                  {coins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.symbol.toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
              {history.length > 1 && (mode === "Line" || mode === "Area") && (
                <span
                  className={`text-sm ml-auto font-semibold ${
                    gainLoss >= 0 ? "text-blue-300" : "text-rose-300"
                  }`}
                >
                  {gainLoss >= 0 ? "+" : ""}
                  {gainLoss.toFixed(2)}%
                </span>
              )}
            </div>

            <div className="relative w-full md:max-w-2xl h-[300px] mt-12 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode + selectedCoin}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  {mode === "Doughnut" ? (
                    <Doughnut
                      data={doughnutData}
                      options={{
                        maintainAspectRatio: false,
                        cutout: "70%",
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            enabled: !allZero,
                            callbacks: {
                              label: (ctx) =>
                                currencyFormatter.format(ctx.raw as number),
                            },
                          },
                        },
                        elements: {
                          arc: {
                            borderWidth: 2,
                            borderColor: chartBorderColor,
                          },
                        },
                      }}
                    />
                  ) : (
                    <Line
                      data={lineData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (ctx) =>
                                currencyFormatter.format(ctx.raw as number),
                            },
                          },
                        },
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
                  )}
                </motion.div>
              </AnimatePresence>
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
