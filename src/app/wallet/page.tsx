"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

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

export default function Page() {
  const [data, setData] = useState<WalletData | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    axios.get("/api/balance/value").then((res) => setData(res.data));
  }, []);

  const nonZeroCoins = data?.breakdown.filter((c) => c.usdValue > 0) || [];

  const chartData = {
    labels: nonZeroCoins.map((c) => c.symbol.toUpperCase()),
    datasets: [
      {
        data: nonZeroCoins.map((c) => c.usdValue),
        backgroundColor: [
          "#60a5fa",
          "#10b981",
          "#f59e0b",
          "#ef4444",
          "#a855f7",
          "#f43f5e",
          "#22d3ee",
          "#f97316",
          "#84cc16",
          "#e11d48",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row gap-4 p-4 overflow-hidden">
      {/* Dropdown-style coin list */}
      <div className="md:w-1/3 w-full bg-zinc-950 rounded-xl">
        <button
          className="flex justify-between items-center w-full px-4 py-3 text-left"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <span className="text-xl font-bold">Your Balances</span>
          <ChevronDown
            size={22}
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            collapsed ? "max-h-0" : "max-h-[70vh]"
          } px-4 pb-4 space-y-3`}
        >
          {data?.breakdown.map((coin) => (
            <div
              key={coin.id}
              className="flex justify-between items-center p-3 rounded-lg bg-zinc-900"
            >
                <Image
                  src={
                    coin.image ||
                    `https://cryptoicon-api.pages.dev/api/icon/${coin.symbol.toLowerCase()}`
                  }
                  alt={coin.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "https://via.placeholder.com/24") {
                      target.src = "https://via.placeholder.com/24";
                    }
                  }}
                  unoptimized
                />
                <div className="flex-1 flex items-center justify-between ml-3">
                <div>
                  <p className="font-semibold">
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </p>
                  <p className="text-sm text-zinc-400">
                    {coin.amount} • ${coin.usdValue.toFixed(2)}
                  </p>
                </div>
              </div>
              <span className="text-sm text-zinc-400 whitespace-nowrap">
                {coin.percentage > 0 ? `${coin.percentage.toFixed(1)}%` : "-"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: chart */}
      <div className="md:w-2/3 w-full bg-zinc-950 rounded-xl p-4 flex flex-col items-center">
        <h2 className="text-xl font-bold mb-2">Total Value</h2>
        <p className="text-4xl font-extrabold text-green-400 mb-4">
          ${data?.totalValue.toFixed(2) || "0.00"}
        </p>

        {data ? (
          <div className="w-full md:w-2/3 h-[300px]">
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      color: "#e5e7eb",
                      font: { size: 14 },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        `${ctx.label}: $${(ctx.raw as number).toFixed(2)}`,
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <p className="text-zinc-400 mt-8">Loading chart...</p>
        )}
      </div>
    </div>
  );
}
