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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export const options = {
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

const CoinLineChart: React.FC<{ data: any }> = ({ data }) => {
  const labels = data?.prices?.map((entry: any) =>
    new Date(entry[0]).toLocaleDateString()
  );
  const dataValues = data?.prices?.map((entry: any) => entry[1]);

  const greenColor = "#00ff00"; // Adjust to match candlestick green

  const initialData = {
    labels,
    datasets: [
      {
        label: "Price",
        data: dataValues,
        borderColor: "#3691ff",
        borderWidth: 2,
        backgroundColor: "rgba(0, 255, 0, 0.3)", // More visible fill
        pointRadius: 0,
        tension: 0.4, // Smooth curve
        fill: "origin", // Ensures fill is applied correctly
      },
    ],
  };

  return (
    <div className="h-[90vh] flex items-center justify-between flex-col w-full">
      <CandlestickChart />
      <div className="relative h-64 w-full bg-black">
        {" "}
        {/* Ensure background contrast */}
        <Line options={options} data={initialData} />
      </div>
    </div>
  );
};

export default CoinLineChart;
