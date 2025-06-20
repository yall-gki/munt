"use client";
import Coin from "@/components/Coin";
import { useEffect, useState } from "react";
import { ids } from "@/lib/ids";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { sortedList } from "@/lib/sort";
import { useCoinsData } from "@/hooks/useCoinData";
import { Loader2 } from "lucide-react";
import axios from "axios";

function Page() {
  const [data, setData] = useState<any[]>([]);
  const [sortedData, setSortedData] = useState<any[]>([]);
  const [favcoin, setFavcoin] = useState<any[]>([]);
  const { data: cacheD, isLoading, isError } = useCoinsData(ids);

  const [sortConfig, setSortConfig] = useState({
    field: "price",
    order: "desc" as "asc" | "desc",
  });

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      const newOrder =
        prev.field === field && prev.order === "desc" ? "asc" : "desc";
      return { field, order: newOrder };
    });
  };

  useEffect(() => {
    if (data.length > 0) {
      const sorted = sortedList(data, sortConfig.field, sortConfig.order);
      setSortedData(sorted);
    }
  }, [data, sortConfig]);
  

  const getFav = async () => {
    try {
      const response = await axios.get("/api/user-coin");
      setFavcoin(response.data);
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
    }
  };

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
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 text-center mt-4">
        ❌ Failed to fetch data
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <CryptoIndexBar currentSort={sortConfig} onSortChange={handleSort} />
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
    </div>
  );
}

export default Page;
