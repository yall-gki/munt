"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
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

interface MiniSparklineProps {
  prices: number[];
  color?: string;
}

const MiniSparkline: React.FC<MiniSparklineProps> = ({
  prices,
  color = "#3b82f6",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gradientBg, setGradientBg] = useState<string | CanvasGradient>(color);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, color + "88"); // semi-transparent
    gradient.addColorStop(1, color + "00"); // fully transparent
    setGradientBg(gradient);
  }, [color, prices]);

  const chartData = {
    labels: prices.map((_, i) => i),
    datasets: [
      {
        data: prices,
        borderColor: color,
        backgroundColor: gradientBg,
        fill: true,
      },
    ],
  };

  return (
    <div className="w-24 h-12 max-sm:w-20 max-sm:h-9">
      <canvas ref={canvasRef} className="hidden" />
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default memo(MiniSparkline);
