"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
] as const;
type IndicatorType = (typeof indicatorList)[number];

type TimeframeOption = { label: string; interval: string };

const timeframes: TimeframeOption[] = [
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
  const [selectedIndicator, setSelectedIndicator] =
    useState<IndicatorType>("SMA");
  const [timeframe, setTimeframe] = useState(timeframes[3]);
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [isExpanded, setIsExpanded] = useState(false);
  const [tradeMarkers, setTradeMarkers] = useState<any[]>([]);

  const { data: klines } = useBinanceKlines(symbol, timeframe.interval);

  const candles = useMemo(() => klines?.candles ?? [], [klines]);

  const closeValues = useMemo(() => candles.map((c) => c.close), [candles]);
  const highValues = useMemo(() => candles.map((c) => c.high), [candles]);
  const lowValues = useMemo(() => candles.map((c) => c.low), [candles]);

  const labels = useMemo(
    () =>
      candles.map((c) =>
        new Date((c.time as number) * 1000).toLocaleDateString()
      ),
    [candles]
  );

  const padLeft = (values: number[], total: number) =>
    Array(Math.max(total - values.length, 0)).fill(null).concat(values);

  const lastUpdatedLabel = useMemo(() => {
    const last = candles[candles.length - 1];
    if (!last) return "—";
    const time = last.time;
    if (typeof time === "number") {
      return new Date(time * 1000).toLocaleString();
    }
    if (
      typeof time === "object" &&
      time !== null &&
      typeof (time as any).year === "number" &&
      typeof (time as any).month === "number" &&
      typeof (time as any).day === "number"
    ) {
      const { year, month, day } = time as { year: number; month: number; day: number };
      const date = new Date(Date.UTC(year, month - 1, day));
      return date.toLocaleDateString();
    }
    return "—";
  }, [candles]);

  const indicatorDataset = useMemo(() => {
    if (closeValues.length === 0) return null;

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

        return {
          label: "MACD",
          data: padLeft(macd.map((m) => m.MACD ?? 0), closeValues.length),
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
  }, [selectedIndicator, closeValues, highValues, lowValues]);

  const indicatorData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: closeValues,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.08)",
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.35,
        fill: false,
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

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await axios.get(`/api/strategies/trades?coinId=${coinId}`);
        const trades = res.data?.trades ?? [];
        const markers = trades
          .map((trade: any) => {
            const time = Math.floor(
              new Date(trade.executedAt).getTime() / 1000
            );
            const isSell = trade.amount < 0;
            return {
              time,
              position: isSell ? "aboveBar" : "belowBar",
              color: isSell ? "#ef4444" : "#22c55e",
              shape: isSell ? "arrowDown" : "arrowUp",
              text: trade.strategy?.name || (isSell ? "Sell" : "Buy"),
            };
          })
          .filter((marker: any) => Number.isFinite(marker.time));
        setTradeMarkers(markers);
      } catch (error) {
        console.error("Failed to load strategy markers", error);
        setTradeMarkers([]);
      }
    };
    fetchMarkers();
  }, [coinId]);

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
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600/15 via-blue-500/10 to-transparent p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300/80">
                Market Chart
              </p>
              <p className="text-xs text-zinc-400">
                Interval {timeframe.label} • Last update {lastUpdatedLabel}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full border border-blue-500/30 bg-zinc-900/80 p-1">
                <button
                  type="button"
                  onClick={() => setChartType("candles")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                    chartType === "candles"
                      ? "bg-blue-500 text-black"
                      : "text-blue-200 hover:text-blue-100"
                  )}
                >
                  <ChartCandlestick className="h-3.5 w-3.5" /> Candles
                </button>
                <button
                  type="button"
                  onClick={() => setChartType("line")}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition",
                    chartType === "line"
                      ? "bg-blue-500 text-black"
                      : "text-blue-200 hover:text-blue-100"
                  )}
                >
                  <LineChart className="h-3.5 w-3.5" /> Line
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-1 rounded-full border border-blue-500/30 bg-zinc-900/80 px-3 py-1 text-xs font-semibold text-blue-200 hover:text-blue-100"
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="h-3.5 w-3.5" /> Collapse
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-3.5 w-3.5" /> Expand
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-blue-200/70">
              Timeframe
            </span>
            <div className="flex flex-wrap gap-2">
              {timeframes.map((frame) => {
                const isActive = frame.interval === timeframe.interval;
                return (
                  <button
                    key={frame.interval}
                    type="button"
                    onClick={() => setTimeframe(frame)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      isActive
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {frame.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-blue-200/70">
              Indicator
            </span>
            <div className="flex flex-wrap gap-2">
              {indicatorList.map((indicator) => {
                const isActive = indicator === selectedIndicator;
                return (
                  <button
                    key={indicator}
                    type="button"
                    onClick={() => setSelectedIndicator(indicator)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      isActive
                        ? "border-blue-400 bg-blue-500/20 text-blue-200"
                        : "border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    {indicator}
                  </button>
                );
              })}
            </div>
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
            markers={tradeMarkers}
          />
        </div>

        <div className="mt-5 border-t border-zinc-800 pt-4 space-y-3">
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
