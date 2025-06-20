// CoinLineChart.tsx
import React from "react";
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
import CandlestickChart from "./charty";
import { useFavoriteCoinsStore } from "@/lib/store";
import TradeHistory from "./tradeHi";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const options: any = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

const CoinLineChart: React.FC<{ data: any; symbol: any }> = ({
  data,
  symbol,
}) => {
  const { line, candle, trades, toggleState } = useFavoriteCoinsStore();
  const labels = data?.prices?.map((entry: any) =>
    new Date(entry[0]).toLocaleDateString()
  );
  const dataValues = data?.prices?.map((entry: any) => entry[1]);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: dataValues,
        borderColor: "#3691ff",
        backgroundColor: "#27272a",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: "origin",
      },
    ],
  };

  return (
    <div className="w-full overflow-hidden
    ">
      <div className="md:hidden flex gap-2 mb-2">
        <button onClick={() => toggleState("candle")}>Candle</button>
        <button onClick={() => toggleState("line")}>Line</button>
        <button onClick={() => toggleState("trades")}>Trades</button>
      </div>
      {candle && <CandlestickChart className="h-33" symbol={symbol} />}
      {line && (
        <div className="relative h-33 w-full bg-zinc-900 rounded-md">
          <Line options={options} data={chartData} />
        </div>
      )}
      {trades && <TradeHistory symbol={symbol} />}
    </div>
  );
};

export default CoinLineChart;
