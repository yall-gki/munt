"use client";

import React, { useMemo } from "react";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/CoinLineChart";
import TradeHistory from "@/components/tradeHi";
import { useChartData } from "@/hooks/useChartData";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Loader2 } from "lucide-react";

interface PageProps {
  params: {
    coinName: string;
    symbol: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { coinName, symbol } = params;

  const { data: coinList, isError } = useCoinsData(ids);
  const { data: chartData, isLoading: chartLoading } = useChartData(coinName);

  const coinData = useMemo(() => {
    if (!Array.isArray(coinList)) return null;
    return coinList.find((coin) => coin.id === coinName);
  }, [coinList, coinName]);

  const loading = chartLoading || !coinData;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (isError || !coinData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        ⚠️ Failed to load coin data.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-10 md:px-44 flex flex-wrap items-start justify-center gap-6">
      <div className="w-full md:w-[30%]">
        <CoinInfo data={coinData} />
      </div>
      <div className="w-full md:w-[40%]">
        <CoinLineChart data={chartData} symbol={symbol} />
      </div>
      <div className="w-full md:w-[25%]">
        <TradeHistory symbol={coinData.symbol} />
      </div>
    </div>
  );
};

export default Page;
