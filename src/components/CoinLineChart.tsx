"use client";
import React, { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { SMA, EMA, BollingerBands, RSI, MACD, VWAP } from "technicalindicators";
import { Maximize2, Minimize2, 
  
  
  LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import CandlestickChartView from "./charty";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index" as const, intersect: false },
  },
  scales: {
    x: { display: false },
    y: {
      display: true,
      ticks: { color: "#94a3b8" },
      grid: { color: "rgba(148, 163, 184, 0.12)" },
    },
  },
};

const indicatorList = [
  "SMA",
  "EMA",
  "Bollinger Bands",
  "RSI",
  "MACD",
  "VWAP",
];

const timeframes = [
  { label: "1m", interval: "1m" },
  { label: "5m", interval: "5m" },
  { label: "15m", interval: "15m" },
  { label: "1h", interval: "1h" },
  { label: "4h", interval: "4h" },
  { label: "1d", interval: "1d" },
];

type ChartType = "candles" | "line";

const CoinLineChart: React.FC<{ data: any; symbol: string }> = ({
  data,
  symbol,
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("SMA");
  const [timeframe, setTimeframe] = useState(timeframes[3]);
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [isExpanded, setIsExpanded] = useState(false);

  const labels =
    data?.prices?.map((entry: any) =>
      new Date(entry[0]).toLocaleDateString()
    ) ?? [];
  const closeValues = data?.prices?.map((entry: any) => entry[1]) ?? [];

  const indicatorDataset = useMemo(() => {
    if (!closeValues || closeValues.length === 0) return null;

    switch (selectedIndicator) {
      case "SMA": {
        const sma = SMA.calculate({ period: 10, values: closeValues });
        return {
          label: "SMA",
          data: [...Array(closeValues.length - sma.length).fill(null), ...sma],
          borderColor: "#f59e0b",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "EMA": {
        const ema = EMA.calculate({ period: 10, values: closeValues });
        return {
          label: "EMA",
          data: [...Array(closeValues.length - ema.length).fill(null), ...ema],
          borderColor: "#8b5cf6",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "Bollinger Bands": {
        const bb = BollingerBands.calculate({
          period: 20,
          values: closeValues,
          stdDev: 2,
        });
        return [
          {
            label: "Upper Band",
            data: [
              ...Array(closeValues.length - bb.length).fill(null),
              ...bb.map((b) => b.upper),
            ],
            borderColor: "#ef4444",
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: "Lower Band",
            data: [
              ...Array(closeValues.length - bb.length).fill(null),
              ...bb.map((b) => b.lower),
            ],
            borderColor: "#ef4444",
            borderWidth: 1,
            pointRadius: 0,
          },
        ];
      }
      case "RSI": {
        const rsi = RSI.calculate({ period: 14, values: closeValues });
        return {
          label: "RSI",
          data: [...Array(closeValues.length - rsi.length).fill(null), ...rsi],
          borderColor: "#22c55e",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "MACD": {
        const macd = MACD.calculate({
          values: closeValues,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        });
        return {
          label: "MACD",
          data: [
            ...Array(closeValues.length - macd.length).fill(null),
            ...macd.map((m) => m.MACD),
          ],
          borderColor: "#38bdf8",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "VWAP": {
        const vwap = VWAP.calculate({
          close: closeValues,
          high: closeValues,
          low: closeValues,
          volume: Array(closeValues.length).fill(100),
        });
        return {
          label: "VWAP",
          data: [...Array(closeValues.length - vwap.length).fill(null), ...vwap],
          borderColor: "#fde047",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      default:
        return null;
    }
  }, [selectedIndicator, closeValues]);

  const indicatorData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: closeValues,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.08)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: true,
      },
      ...(Array.isArray(indicatorDataset)
        ? indicatorDataset
        : indicatorDataset
        ? [indicatorDataset]
        : []),
    ],
  };

  return (
    <div className="w-full">
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      <div
        className={cn(
          "relative rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 md:p-6 shadow-xl",
          isExpanded && "fixed inset-6 z-50"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Market Chart
            </p>
            <p className="text-sm text-zinc-200 font-semibold">
              {symbol.toUpperCase()} / USDT
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-zinc-800/80 p-1">
              {timeframes.map((frame) => (
                <button
                  key={frame.label}
                  onClick={() => setTimeframe(frame)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-full transition",
                    timeframe.label === frame.label
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:text-white"
                  )}
                >
                  {frame.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-full bg-zinc-800/80 p-1">
              <button
                onClick={() => setChartType("candles")}
                className={cn(
                  "p-2 rounded-full transition",
                  chartType === "candles"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:text-white"
                )}
                aria-label="Candlestick chart"
              >

              </button>
              <button
                onClick={() => setChartType("line")}
                className={cn(
                  "p-2 rounded-full transition",
                  chartType === "line"
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:text-white"
                )}
                aria-label="Line chart"
              >
                <LineChart className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-2 rounded-full bg-zinc-800/80 text-zinc-200 hover:text-white transition"
              aria-label={isExpanded ? "Exit fullscreen" : "Expand chart"}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "mt-4 h-[320px] md:h-[420px]",
            isExpanded && "h-[70vh]"
          )}
        >
          <CandlestickChartView
            symbol={symbol}
            interval={timeframe.interval}
            chartType={chartType}
          />
        </div>

        <div className="mt-5 border-t border-zinc-800 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">
              Indicator Overlay
            </span>
            <select
              className="bg-zinc-800 text-white text-xs px-3 py-2 rounded-full"
              value={selectedIndicator}
              onChange={(e) => setSelectedIndicator(e.target.value)}
            >
              {indicatorList.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
          <div className="relative h-52 md:h-60">
            <Line options={chartOptions} data={indicatorData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinLineChart;
