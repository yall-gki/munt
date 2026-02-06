"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  Wallet,
  Sparkles,
  Activity,
  Layers,
  Loader2,
} from "lucide-react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
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

// --- Types ---
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

// --- Constants ---
const chartPalette = [
  "#3B82F6",
  "#60A5FA",
  "#0EA5E9",
  "#38BDF8",
  "#6366F1",
  "#8B5CF6",
  "#93C5FD",
  "#A5B4FC",
  "#7DD3FC",
  "#1D4ED8",
];

const chartModes = ["Doughnut", "Line", "Area"] as const;
type ChartMode = (typeof chartModes)[number];

// --- Component ---
export default function WalletPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<WalletData | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mode, setMode] = useState<ChartMode>("Doughnut");
  const [selectedCoin, setSelectedCoin] = useState<string>("");
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [strategyPerformance, setStrategyPerformance] = useState<
    StrategyPerformance[]
  >([]);
  const [strategyTrades, setStrategyTrades] = useState<StrategyTrade[]>([]);
  const [strategyLoading, setStrategyLoading] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
    }
  }, [status]);

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

  // Load balances
  useEffect(() => {
    axios
      .get("/api/balance/value")
      .then((res) => {
        res.data.breakdown.sort((a: any, b: any) => b.usdValue - a.usdValue);
        setData(res.data);

        if (res.data.breakdown.length) {
          setSelectedCoin(res.data.breakdown[0].id);
        }
      })
      .catch(() => {
        setData({ totalValue: 0, breakdown: [] });
      });
  }, []);

  // Load history
  useEffect(() => {
    if (!selectedCoin) return;
    axios
      .get(`/api/portfolio/history/${selectedCoin}`)
      .then((res) => setHistory(res.data));
  }, [selectedCoin]);

  // Load strategies
  useEffect(() => {
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
        console.error(error);
      } finally {
        setStrategyLoading(false);
      }
    };

    fetchStrategies();
  }, []);

  // Screen size check
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const listener = () => setIsSmallScreen(mq.matches);
    listener();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  if (status === "loading" || !data) {
    return (
      <div className="min-h-full bg-black text-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
      </div>
    );
  }

  // --- Charts ---
  const coins = data.breakdown || [];
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
        borderWidth: 2,
        borderColor: "rgba(59, 130, 246, 0.35)",
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
        backgroundColor: mode === "Area" ? "rgba(59,130,246,0.2)" : "transparent",
        borderColor: "#3B82F6",
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
        borderRadius: 6,
      },
    ],
  };

  // --- Render ---
  return (
    <div className="min-h-full bg-black text-white p-4">
      {/* Top CTA */}
      <div className="flex justify-end mb-4">
        <Link href={session ? "/wallet" : "/login"}>
          <button className="px-6 py-3 bg-zinc-900 border border-blue-500/40 text-blue-200 text-lg font-semibold rounded-full hover:bg-blue-500/10 transition-all">
            View Portfolio
          </button>
        </Link>
      </div>

      {/* Your existing wallet dashboard JSX goes here */}
      {/* ...copy all the existing JSX for charts, balances, strategy, etc. */}
    </div>
  );
}

// --- Coin item ---
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
        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24")}
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
