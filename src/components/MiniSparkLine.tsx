import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement);

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

const MiniSparkline: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: data?.prices?.map((p: any) => p[0]),
    datasets: [
      {
        data: data?.prices?.map((p: any) => p[1]),
        borderColor: "#3b82f6", // Tailwind's blue-500
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
