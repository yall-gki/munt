import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";

const CandlestickChart = ({ symbol }: any) => {
  const chartContainerRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=1h&limit=2000`
        );
        const rawData = await response.json();
        const formattedData = rawData.map((item: any) => ({
          time: item[0] / 1000,
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [symbol]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        textColor: "gray",
        background: { color: "#18181b" },
      },
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: "transparent" },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(data);

    // ✅ Customize the time scale
    // ✅ Customize the time scale
    chart.timeScale().applyOptions({
      borderColor: "#71649C",
      barSpacing: 20, // Zoomed in: bars will look larger
    });

  
    return () => chart.remove();
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="overflow-hidden h-3/4 w-full relative rounded-md text-neutral-600"
      style={{ width: "100%", height: "500px", margin: "0 auto", padding: "0" }}
    />
  );
};

export default CandlestickChart;
