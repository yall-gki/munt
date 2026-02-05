"use client";

import React, { useMemo, useState } from "react";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/charts/CoinLineChart";
import TradeHistory from "@/components/tradeHi";
import ExecutedTradesLog from "@/components/ExecutedTradesLog";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Loader2 } from "lucide-react";
import { use } from "react";

const Page: React.FC<{ params: Promise<{ coin: string; symbol: string }> }> = ({
  params,
}) => {
  const { coin, symbol } = use(params);
  const [tradeRefreshKey, setTradeRefreshKey] = useState(0);

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
          <CoinLineChart symbol={symbol} coinId={coinData.id} />
        </div>

        <div className="space-y-6">
          <TradeHistory symbol={coinData.symbol} />
        </div>
      </div>
    </div>
  );
};

export default Page;
