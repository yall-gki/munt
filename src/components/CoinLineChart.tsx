// CoinLineChart.tsx
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
import {
  SMA,
  EMA,
  BollingerBands,
  RSI,
  MACD,
  VWAP,
  IchimokuCloud,
} from "technicalindicators";
import { useFavoriteCoinsStore } from "@/lib/store";
import CandlestickChart from "./charty";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const options: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { display: false },
    y: { display: true },
  },
};

const indicatorList = [
  "SMA",
  "EMA",
  "Bollinger Bands",
  "RSI",
  "MACD",
  "VWAP",
  "Ichimoku Cloud",
];

const CoinLineChart: React.FC<{ data: any; symbol: string }> = ({
  data,
  symbol,
}) => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>("SMA");
  const { line } = useFavoriteCoinsStore();

  const labels = data?.prices?.map((entry: any) =>
    new Date(entry[0]).toLocaleDateString()
  );
  const closeValues = data?.prices?.map((entry: any) => entry[1]);

  const indicatorDataset = useMemo(() => {
    if (!closeValues || closeValues.length === 0) return null;

    switch (selectedIndicator) {
      case "SMA":
        const sma = SMA.calculate({ period: 10, values: closeValues });
        return {
          label: "SMA",
          data: [...Array(closeValues.length - sma.length).fill(null), ...sma],
          borderColor: "orange",
          borderWidth: 1,
          pointRadius: 0,
        };

      case "EMA":
        const ema = EMA.calculate({ period: 10, values: closeValues });
        return {
          label: "EMA",
          data: [...Array(closeValues.length - ema.length).fill(null), ...ema],
          borderColor: "purple",
          borderWidth: 1,
          pointRadius: 0,
        };

      case "Bollinger Bands":
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
            borderColor: "red",
            borderWidth: 1,
            pointRadius: 0,
          },
          {
            label: "Lower Band",
            data: [
              ...Array(closeValues.length - bb.length).fill(null),
              ...bb.map((b) => b.lower),
            ],
            borderColor: "red",
            borderWidth: 1,
            pointRadius: 0,
          },
        ];

      case "RSI":
        const rsi = RSI.calculate({ period: 14, values: closeValues });
        return {
          label: "RSI",
          data: [...Array(closeValues.length - rsi.length).fill(null), ...rsi],
          borderColor: "lime",
          borderWidth: 1,
          pointRadius: 0,
        };

      case "MACD":
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
          borderColor: "cyan",
          borderWidth: 1,
          pointRadius: 0,
        };

      case "VWAP":
        const vwap = VWAP.calculate({
          close: closeValues,
          high: closeValues,
          low: closeValues,
          volume: Array(closeValues.length).fill(100),
        });
        return {
          label: "VWAP",
          data: [
            ...Array(closeValues.length - vwap.length).fill(null),
            ...vwap,
          ],
          borderColor: "yellow",
          borderWidth: 1,
          pointRadius: 0,
        };

      default:
        return null;
    }
  }, [selectedIndicator, closeValues]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: closeValues,
        borderColor: "#3691ff",
        backgroundColor: "#27272a",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: "origin",
      },
      ...(Array.isArray(indicatorDataset)
        ? indicatorDataset
        : indicatorDataset
        ? [indicatorDataset]
        : []),
    ],
  };

  return (
    <div className="w-full space-y-2">
      {/* Indicator Selector */}

      <CandlestickChart symbol={symbol} />
      <div className="relative h-60 w-full bg-zinc-900 rounded-md p-2">
        <div className="absolute top-2 right-0 flex justify-end px-2">
          <select
            className="bg-zinc-800 text-white text-sm px-2 py-1 rounded"
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
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default CoinLineChart;
