"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Coin from "@/components/Coin";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { useFavoriteCoinsStore } from "@/lib/store";
import { sortedList } from "@/lib/sort";

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

  const fetchFavorites = useFavoriteCoinsStore((s) => s.fetchFavorites);

  const fetchAllData = useCallback(async () => {
    try {
      const marketRes = await fetch("/api/coin-history").then((res) =>
        res.json()
      );
      setData(marketRes);
      await fetchFavorites();
    } catch (err) {
      console.error("Error fetching market data:", err);
    }
  }, [fetchFavorites]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const sortedData = useMemo(() => {
    return sortedList(data, sortConfig.field, sortConfig.order);
  }, [data, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  if (data.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Index Bar */}
        <CryptoIndexBar currentSort={sortConfig} onSortChange={handleSort} />

        {/* Coin List */}
        <div className="flex flex-col gap-4 mt-2">
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
    </div>
  );
};

export default Page;
