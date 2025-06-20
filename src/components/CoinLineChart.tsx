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
    x: { display: false }, // Hide X-axis
    y: { display: false }, // Hide Y-axis
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
console.log(dataValues);

  const initialData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: dataValues,
        borderColor: "#3691ff",
        borderWidth: 2,
        backgroundColor: "#27272a",
        pointRadius: 0,
        tension: 0.4,
        fill: "origin",
      },
    ],
  };

  return (
    <div className="h-full flex items-center justify-between flex-col w-1/2">
      <div className="wrap h-full p-2 gap-2 w-full flex flex-col rounded-md">
        <span className="flex gap-2 md:hidden">
          <span
            onClick={() => toggleState("candle")}
            className="cursor-pointer"
          >
            Candle
          </span>
          <span onClick={() => toggleState("line")} className="cursor-pointer">
            Line
          </span>
          <span
            onClick={() => toggleState("trades")}
            className="cursor-pointer"
          >
            Trades
          </span>
        </span>
        {candle && <CandlestickChart symbol={symbol} />}
        {line && (
          <div className="relative h-64 w-full bg-zinc-900 rounded-md">
            <Line options={options} data={initialData} />
          </div>
        )}
        {trades && <TradeHistory symbol={symbol} />}
      </div>
    </div>
  );
};

export default CoinLineChart;
