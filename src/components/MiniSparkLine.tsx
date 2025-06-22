import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    line: {
      tension: 0.3,
      borderWidth: 2,
    },
    point: {
      radius: 0,
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
};

const MiniSparkline: React.FC<{ prices: number[] }> = ({ prices }) => {
  if (!prices || prices.length === 0) {
    return <div className="w-24 h-12 animate-pulse bg-zinc-700 rounded" />;
  }

  const chartData = {
    labels: prices.map((_, i) => i),
    datasets: [
      {
        data: prices,
        borderColor: "#3b82f6",
        backgroundColor: "transparent",
      },
    ],
  };

  return (
    <div className="w-24 h-12 max-sm:w-20 max-sm:h-10">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default MiniSparkline;
