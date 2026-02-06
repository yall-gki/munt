"use client";

import React, { useMemo, useState, use } from "react";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/charts/CoinLineChart";
import ExecutedTradesLog from "@/components/ExecutedTradesLog";
import TradeHistory from "@/components/tradeHi";
import CryptoNews from "@/components/CryptoNews"; // <- import the news component
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Loader2 } from "lucide-react";

const Page: React.FC<{ params: Promise<{ coin: string; symbol: string }> }> = ({
  params,
}) => {
  const { coin, symbol } = use(params);
  const [tradeRefreshKey, setTradeRefreshKey] = useState(0);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  const { data: coinList, isError } = useCoinsData(ids);
  const coinData = useMemo(() => {
    if (!Array.isArray(coinList)) return null;
    return coinList.find((item) => item.id === coin) || null;
  }, [coinList, coin]);

  const loading = !coinData;

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
    <div className="min-h-full bg-black text-white px-4 py-6 relative">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-6">
        {/* Left: Coin info + executed trades */}
        <div className="space-y-6">
          <CoinInfo
            data={coinData}
            onTradeComplete={() => setTradeRefreshKey((prev) => prev + 1)}
          />
          <ExecutedTradesLog coinId={coinData.id} refreshKey={tradeRefreshKey} />
        </div>

        {/* Center: Chart */}
        <div className="space-y-6">
          <CoinLineChart symbol={symbol} coinId={coinData.id} />
        </div>

        {/* Right: Crypto news */}
        <div className="space-y-6">
          <CryptoNews coinId={coinData.id} />
        </div>
      </div>

      {/* TradeHistory toggle button */}
      <button
        onClick={() => setIsTradeOpen((prev) => !prev)}
        className="fixed top-1/2 right-0 z-50 flex items-center justify-center h-32 w-10 bg-zinc-900/90 text-white rounded-l-md text-xs tracking-widest transform -translate-y-1/2 hover:bg-zinc-800/95"
      >
        <span className="rotate-90">Trades</span>
      </button>

      {/* TradeHistory panel */}
      <TradeHistory
        symbol={symbol}
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
      />
    </div>
  );
};

export default Page;
