"use client";
import React, { useMemo, useState } from "react";
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
import { ChartCandlestick, LineChart, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CandlestickChartView from "./CandlestickChartView";
import { useBinanceKlines } from "@/hooks/useBinanceKlines";
import StrategyPanel from "./StrategyPanel";

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

const CoinLineChart: React.FC<{ symbol: string; coinId: string }> = ({
  symbol,
  coinId,
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("SMA");
  const [timeframe, setTimeframe] = useState(timeframes[3]);
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: klines } = useBinanceKlines(symbol, timeframe.interval);
  const candles = klines?.candles ?? [];
  const closeValues = candles.map((c) => c.close);
  const highValues = candles.map((c) => c.high);
  const lowValues = candles.map((c) => c.low);
  const labels = candles.map((c) =>
    new Date((c.time as number) * 1000).toLocaleDateString()
  );

  const padLeft = (values: number[], total: number) =>
    Array(Math.max(total - values.length, 0)).fill(null).concat(values);

  const indicatorDataset = useMemo(() => {
    if (!closeValues || closeValues.length === 0) return null;

    switch (selectedIndicator) {
      case "SMA": {
        const sma = SMA.calculate({ period: 10, values: closeValues });
        return {
          label: "SMA",
          data: padLeft(sma, closeValues.length),
          borderColor: "#60a5fa",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "EMA": {
        const ema = EMA.calculate({ period: 10, values: closeValues });
        return {
          label: "EMA",
          data: padLeft(ema, closeValues.length),
          borderColor: "#a78bfa",
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
            data: padLeft(bb.map((b) => b.upper), closeValues.length),
            borderColor: "#38bdf8",
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: "Lower Band",
            data: padLeft(bb.map((b) => b.lower), closeValues.length),
            borderColor: "#818cf8",
            borderWidth: 1,
            pointRadius: 0,
          },
        ];
      }
      case "RSI": {
        const rsi = RSI.calculate({ period: 14, values: closeValues });
        return {
          label: "RSI",
          data: padLeft(rsi, closeValues.length),
          borderColor: "#f97316",
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
        const macdLine = macd.map((m) => m.MACD);
        return {
          label: "MACD",
          data: padLeft(macdLine, closeValues.length),
          borderColor: "#22d3ee",
          borderWidth: 1,
          pointRadius: 0,
        };
      }
      case "VWAP": {
        const vwap = VWAP.calculate({
          close: closeValues,
          high: highValues.length ? highValues : closeValues,
          low: lowValues.length ? lowValues : closeValues,
          volume: Array(closeValues.length).fill(100),
        });
        return {
          label: "VWAP",
          data: padLeft(vwap, closeValues.length),
          borderColor: "#fbbf24",
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

  const indicatorOptions = useMemo(() => {
    if (selectedIndicator === "RSI") {
      return {
        ...chartOptions,
        scales: {
          ...chartOptions.scales,
          y: {
            ...chartOptions.scales.y,
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      };
    }
    return chartOptions;
  }, [selectedIndicator]);

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
                      ? "bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.45)]"
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
                    ? "bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.45)]"
                    : "text-zinc-300 hover:text-white"
                )}
                aria-label="Candlestick chart"
              >
                <ChartCandlestick className="h-4 w-4" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={cn(
                  "p-2 rounded-full transition",
                  chartType === "line"
                    ? "bg-blue-500 text-black shadow-[0_0_12px_rgba(59,130,246,0.45)]"
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
            <Line options={indicatorOptions} data={indicatorData} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <StrategyPanel coinId={coinId} />
      </div>
    </div>
  );
};

export default CoinLineChart;
