import React, { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart } from "lightweight-charts";
import { Grid } from "lucide-react";

const CandlestickChart = () => {
  const chartContainerRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=2000"
        );
        const rawData = await response.json();
        const formattedData = rawData.map((item : any) => ({
          time: item[0] / 1000, // Convert milliseconds to seconds
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
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const chartOptions = {
      layout: {
        textColor: "black",
        background: { type: "solid", color: "white" },
      },
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: "transparent" },
      },
      priceLineVisible: true,

      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 0,
          maxValue: 100,
        },
        margins: {
          above: 10,
          below: 10,
        },
      }),
      baseLineWidth : 4
    };
    const chart = createChart(chartContainerRef.current, chartOptions as any);

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    candlestickSeries.setData(data);
    chart.timeScale().fitContent();

    return () => chart.remove();
  }, [data]);

  return (
    <div
      ref={chartContainerRef}
      className="overflow-hidden "
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export default CandlestickChart;
