"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

import Coin from "@/components/Coin";
import { ids } from "@/lib/ids";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { sortedList } from "@/lib/sort";

function Page() {
  const [data, setData] = useState<any[]>([]);
  const [favcoin, setFavcoin] = useState<any[]>([]);

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

  const getMarketData = async () => {
    try {
      const res = await fetch("/api/coin-history");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch market data", err);
    }
  };

  const getFav = async () => {
    try {
      const response = await axios.get("/api/user-coin");
      setFavcoin(response.data);
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
    }
  };

  useEffect(() => {
    getMarketData();
    getFav();
  }, []);

  const sortedData = useMemo(() => {
    return sortedList(data, sortConfig.field, sortConfig.order);
  }, [data, sortConfig]);

  if (data.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <CryptoIndexBar currentSort={sortConfig} onSortChange={handleSort} />
        {sortedData.map((coin) => (
          <Coin
            key={coin.id}
            id={coin.id}
            name={coin.name}
            price={coin.current_price}
            image={coin.image}
            marketCap={coin.market_cap}
            symbol={coin.symbol}
            sparkline={coin.sparkline_in_7d?.price || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Page;
