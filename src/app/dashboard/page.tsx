"use client";
import Coin from "@/components/Coin";
import { useEffect, useState } from "react";
import { ids } from "@/lib/ids";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { sortedList } from "@/lib/sort";
import { useCoinsData } from "@/hooks/useCoinData";
import { Loader2 } from "lucide-react";

function page() {
  const [data, setData] = useState<any>([]); // To store data for each coin
  const [sortOrder, setSortOrder] = useState<string>("asc"); // To store data for each coin
  const [sortedData, setSortedData] = useState<any>([]);
  const { data: cacheD, isLoading, isError } = useCoinsData(ids);

  const handleSort = (order: string) => {
    setSortOrder((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
    const sorted = sortedList(data, order, sortOrder);
    setSortedData(sorted);
  };
  useEffect(() => {
    setData(cacheD);
    // Also set the sortedData initially with the fetched data
    setSortedData(cacheD);
  }, [cacheD]);
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 text-green-500  animate-spin" />
      </div>
    );
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <div className="pt-20 w-screen">
      <CryptoIndexBar sort={handleSort} />
      {sortedData?.map((coin: any) => (
        <Coin
          key={coin.symbol}
          name={coin.name}
          price={coin.current_price}
          image={coin.image}
          marketCap={coin.market_cap}
          symbol={coin.symbol}
        />
      ))}
    </div>
  );
}

export default page;
