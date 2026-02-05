"use client";

import React, { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  LineSeries,
  createChart,
  type CandlestickData,
  type LineData,
  type IChartApi,
  type ISeriesApi,
} from "lightweight-charts";
import { useBinanceKlines } from "@/hooks/useBinanceKlines";

type ChartType = "candles" | "line";

interface CandlestickChartProps {
  symbol: string;
  interval: string;
  chartType: ChartType;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  interval,
  chartType,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);
  const { data, isLoading, error } = useBinanceKlines(symbol, interval);
  const candles = (data?.candles ?? []) as CandlestickData[];
  const line = (data?.line ?? []) as LineData[];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        textColor: "#94a3b8",
        background: { color: "#0b0b0f" },
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      rightPriceScale: { borderColor: "rgba(148, 163, 184, 0.2)" },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        horzLine: { color: "rgba(148, 163, 184, 0.25)", labelBackgroundColor: "#111827" },
        vertLine: { color: "rgba(148, 163, 184, 0.25)", labelBackgroundColor: "#111827" },
      },
    });

    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width && entry.contentRect.height) {
          chart.resize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
    }

    if (chartType === "line") {
      seriesRef.current = chartRef.current.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
      });
      seriesRef.current.setData(line);
    } else {
      seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderVisible: false,
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      seriesRef.current.setData(candles);
    }

    chartRef.current.timeScale().fitContent();
  }, [chartType, candles, line]);

  return (
    <div className="relative h-full w-full">
      <div ref={chartContainerRef} className="h-full w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-zinc-300">
          Loading chart...
        </div>
      )}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-zinc-300">
          Market data unavailable for this pair.
        </div>
      )}
    </div>
  );
};

export default CandlestickChart;
