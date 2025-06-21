// Page.tsx
"use client";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/CoinLineChart";
import { useChartData } from "@/hooks/useChartData";
import { ids } from "@/lib/ids";
import { useCoinsData } from "@/hooks/useCoinData";
import { Loader2 } from "lucide-react";
import TradeHistory from "@/components/tradeHi";
import React from "react";

interface pageProps {
  params: any;
}

const Page: ({ params }: pageProps) => any = ({ params }) => {
  const { coinName, symbol } = React.use<any>(params);
  const { data: coin, isError } = useCoinsData(ids);
  const { data: chartData, isLoading } = useChartData(coinName);

  let coinData;
  if (Array.isArray(coin)) {
    coinData = coin.find((coin: any) => coin.id === coinName);
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-screen h-full p-4 max-sm:p-4 md:p-10 md:px-44 bg-black flex flex-wrap items-start justify-center gap-4">
      <div className="w-full md:w-[30%] ">
        <CoinInfo data={coinData} />
      </div>
      <div className="w-full md:w-[40%]    ">
        <CoinLineChart data={chartData} symbol={symbol} />
      </div>
      <div className="w-full md:w-[25%]  ">
        <TradeHistory symbol={coinData?.symbol} />
      </div>
    </div>
  );
};

export default Page;
