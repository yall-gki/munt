"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";

import Coin from "@/components/Coin";
import { ids } from "@/lib/ids";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { sortedList } from "@/lib/sort";
import { useFavoriteCoinsStore } from "@/lib/store";

type CoinData = {
  id: string;
  name: string;
  current_price: number;
  image: string;
  market_cap: number;
  symbol: string;
  sparkline_in_7d?: { price: number[] };
  price_change_percentage_24h: number;
};

const Page = () => {
  const [data, setData] = useState<CoinData[]>([]);
  const [sortConfig, setSortConfig] = useState({
    field: "price",
    order: "desc" as "asc" | "desc",
  });

  // ✅ FIX: use direct selector for stable reference
  const fetchFavorites = useFavoriteCoinsStore((s) => s.fetchFavorites);

  const handleSort = (field: string) => {
    setSortConfig((prev) => {
      const newOrder =
        prev.field === field && prev.order === "desc" ? "asc" : "desc";
      return { field, order: newOrder };
    });
  };

  const fetchAllData = useCallback(async () => {
    try {
      const marketRes = await fetch("/api/coin-history").then((res) =>
        res.json()
      );
      setData(marketRes);

      await fetchFavorites(); // ✅ safely called here
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const sortedData = useMemo(() => {
    return sortedList(data, sortConfig.field, sortConfig.order);
  }, [data, sortConfig]);

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
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
            change24h={coin.price_change_percentage_24h}
          />
        ))}
      </div>
    </div>
  );
};

export default Page;
