"use client";
import Coin from "@/components/Coin";
import { useEffect, useState } from "react";
import { ids } from "@/lib/ids";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { sortedList } from "@/lib/sort";
import { useCoinsData } from "@/hooks/useCoinData";
import { Loader2 } from "lucide-react";
import axios from "axios";
import FavoriteCoins from "@/components/FavoriteCoins";

function Page() {
  const [data, setData] = useState<any[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [favcoin, setFavcoin] = useState<any[]>([]);

  const { data: cacheD, isLoading, isError } = useCoinsData(ids);

  // Get images for favorite coins
  function getImage(coinId: string) {
    if (!Array.isArray(cacheD)) return [];
    const coinData = cacheD.find((coin) => coin.id === coinId);
    return coinData ? coinData.image : null;
  }

  // Sort Function
  const handleSort = (order: string) => {
    const sorted = sortedList(data, order, sortOrder);
    setSortedData(sorted);
    setSortOrder(order);
  };

  // Fetch Favorite Coins
  const getFav = async () => {
    try {
      const response = await axios.get("/api/user-coin");
      setFavcoin(response.data);
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
    }
  };

  // Effect to Fetch Data
  useEffect(() => {
    getFav();
  }, []);

  useEffect(() => {
    if (cacheD) {
      setData(cacheD);
      setSortedData(cacheD);
    }
  }, [cacheD]);

  if (isLoading) {
    return (
      <>
        <div className="h-full w-screen flex items-center justify-center">
          <Loader2 className="mr-2 h-8 w-8 text-green-500 animate-spin" />
        </div>
      </>
    );
  }

  if (isError) {
    return <div>Error fetching data</div>;
  }

  return (
    <>
      <div className="container px-2 sm:px-8">
        <CryptoIndexBar sort={handleSort} />
        {sortedData?.map((coin) => (
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
    </>
  );
}

export default Page;
