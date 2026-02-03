"use client";

import React, { useMemo, useState } from "react";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/CoinLineChart";
import TradeHistory from "@/components/tradeHi";
import ExecutedTradesLog from "@/components/ExecutedTradesLog";
import { useChartData } from "@/hooks/useChartData";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Loader2 } from "lucide-react";
import { use } from "react";

const Page: React.FC<{ params: Promise<{ coinName: string; symbol: string }> }> = ({
  params,
}) => {
  const { coinName, symbol } = use(params);
  const [tradeRefreshKey, setTradeRefreshKey] = useState(0);

  const { data: coinList, isError } = useCoinsData(ids);
  const { data: chartData, isLoading: chartLoading } = useChartData(coinName);

  const coinData = useMemo(() => {
    if (!Array.isArray(coinList)) return null;
    return coinList.find((coin) => coin.id === coinName) || null;
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
    <div className="min-h-full bg-black text-white px-4 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-6">
        <div className="space-y-6">
          <CoinInfo
            data={coinData}
            onTradeComplete={() => setTradeRefreshKey((prev) => prev + 1)}
          />
          <ExecutedTradesLog coinId={coinData.id} refreshKey={tradeRefreshKey} />
        </div>

        <div className="space-y-6">
          <CoinLineChart data={chartData} symbol={symbol} />
        </div>

        <div className="space-y-6">
          <TradeHistory symbol={coinData.symbol} />
        </div>
      </div>
    </div>
  );
};

export default Page;
