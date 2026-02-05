"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import Coin from "@/components/Coin";
import CryptoIndexBar from "@/components/CryptoIndexBar";
import { useFavoriteCoinsStore } from "@/lib/store";
import { sortedList } from "@/lib/sort";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";

const Page = () => {
  const [sortConfig, setSortConfig] = useState({
    field: "price",
    order: "desc" as "asc" | "desc",
  });

  const fetchFavorites = useFavoriteCoinsStore((s) => s.fetchFavorites);
  const { data = [], isLoading } = useCoinsData(ids);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const sortedData = useMemo(() => {
    return sortedList(data, sortConfig.field, sortConfig.order);
  }, [data, sortConfig]);

  const handleSort = (field: string) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  if (isLoading) {
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
        <div className="flex flex-col  mt-2">
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
