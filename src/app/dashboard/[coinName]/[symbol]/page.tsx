"use client";
import CoinInfo from "@/components/CoinInfo";
import CoinLineChart from "@/components/CoinLineChart";
import { useChartData } from "@/hooks/useChartData";
import { ids } from "@/lib/ids";
import { useCoinsData } from "@/hooks/useCoinData";
import { Loader2 } from "lucide-react";
import CandlestickChart from "@/components/charty";
import TradeHistory from "@/components/tradeHi";
import { useRouter } from "next/router";
import React from "react";

// Inside your component

interface pageProps {
  params: any
}

const Page: ({ params }: pageProps) => any = ({ params }) => {
  const { coinName,symbol } = React.use<any>(params);
 
  const { data: coin, isError } = useCoinsData(ids);
  const { data: chartData, isLoading } = useChartData(coinName);
  let coinData;
  if (Array.isArray(coin)) {
    coinData = coin.find((coin: any) => coin.id === coinName);
  }
  console.log(chartData);
  console.log(coinData);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }
  return (
    <>
      <div className="max-w-screen h-full p-10 px-44 bg-black  flex items-center justify-center max-md:flex-col ">
        <div className="wrapp h-full w-full flex items-center justify-center  ">
          <CoinInfo data={coinData} />
          <CoinLineChart data={chartData} symbol={symbol}  />
          <TradeHistory symbol={coinData?.symbol} />
        </div>
      </div>
    </>
  );
};

export default Page;
