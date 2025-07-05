"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { ChevronDown, Wallet } from "lucide-react";
import { Doughnut, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
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

type WalletData = {
  totalValue: number;
  breakdown: CoinBalance[];
};

const coinColors: Record<string, string> = {
  bitcoin: "#F7931A",
  ethereum: "#3C3C3D",
  binancecoin: "#F0B90B",
  cardano: "#0033AD",
  xrp: "#23292F",
  polkadot: "#E6007A",
  dogecoin: "#C2A633",
  default: "#3B82F6",
};

const chartModes = ["Doughnut", "Line", "Area"] as const;
type ChartMode = (typeof chartModes)[number];

export default function Page() {
  const [data, setData] = useState<WalletData | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mode, setMode] = useState<ChartMode>("Doughnut");
  const [selectedCoin, setSelectedCoin] = useState<string>("");

  useEffect(() => {
    axios.get("/api/balance/value").then((res) => {
      setData(res.data);
      if (res.data.breakdown.length) {
        setSelectedCoin(res.data.breakdown[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const listener = () => setIsSmallScreen(mq.matches);
    listener();
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const coins = data?.breakdown || [];
  const chartColorsUsed = coins.map(
    (c) => coinColors[c.id] || coinColors.default
  );
  const usdValues = coins.map((c) => c.usdValue || 0);
  const coinLabels = coins.map((c) => c.symbol.toUpperCase());

  // ensure pie/doughnut show even if zero
  const allZero = usdValues.every((v) => v === 0);
  const displayValues = allZero
    ? usdValues.map((v, i) => (i === 0 ? 0.00001 : 0))
    : usdValues;

  const doughnutData = {
    labels: coinLabels,
    datasets: [
      { data: displayValues, backgroundColor: chartColorsUsed, borderWidth: 0 },
    ],
  };

  const selectedBalanceHistory = (() => {
    const now = Date.now();
    const coin = coins.find((c) => c.id === selectedCoin);
    const amount = coin?.amount || 0;
    // Mock recent points: [6 days ago... today]
    const history = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * 86400000).toLocaleDateString("en-US"),
      value: amount * Math.random() * 0.2 + amount * 0.9,
    }));
    return history;
  })();

  const lineData = {
    labels: selectedBalanceHistory.map((h) => h.date),
    datasets: [
      {
        data: selectedBalanceHistory.map((h) => h.value),
        backgroundColor:
          mode === "Area" ? "rgba(59,130,246,0.2)" : "transparent",
        borderColor: "#3B82F6",
        tension: 0.4,
        fill: mode === "Area",
      },
    ],
  };

  return (
    <div className="min-h-full bg-black text-white flex flex-col md:flex-row gap-4 p-4">
      {/* Coin list */}
      <div className="md:w-1/3 w-full bg-zinc-950 rounded-xl overflow-hidden">
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
            {coins.map((c) => (
              <CoinItem key={c.id} coin={c} />
            ))}
          </div>
        )}
      </div>

      {/* Chart panel */}
      <div className="md:w-2/3 w-full bg-zinc-950 rounded-xl px-6 py-6 flex flex-col gap-6 items-center">
        <div className="w-full flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold">Total Value</h2>
            <p className="text-4xl font-extrabold text-blue-500">
              ${data?.totalValue.toFixed(2) || "0.00"}
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold hover:opacity-90 transition">
            <Wallet className="w-4 h-4" /> Connect Wallet
          </button>
        </div>

        {/* Mode tabs and coin selector */}
        <div className="w-full flex flex-wrap gap-3">
          {chartModes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-sm font-medium rounded-full transition ${
                mode === m
                  ? "bg-blue-500 text-black"
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
        </div>

        {/* Chart container */}
        <div className="relative w-full md:max-w-2xl h-[300px] mt-20">
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
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        enabled: !allZero,
                        callbacks: {
                          label: (ctx) => `$${(ctx.raw as number).toFixed(2)}`,
                        },
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
                          label: (ctx) => `$${(ctx.raw as number).toFixed(2)}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: { color: "#9ca3af" },
                        grid: { color: "rgba(255,255,255,0.05)" },
                      },
                      y: {
                        ticks: { color: "#9ca3af" },
                        grid: { color: "rgba(255,255,255,0.05)" },
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
  );
}

function CoinItem({ coin }: { coin: CoinBalance }) {
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
          {coin.amount} • ${coin.usdValue.toFixed(2)}
        </p>
      </div>
      <span className="text-sm text-zinc-400 whitespace-nowrap">
        {coin.percentage > 0 ? `${coin.percentage.toFixed(1)}%` : "-"}
      </span>
    </div>
  );
}
