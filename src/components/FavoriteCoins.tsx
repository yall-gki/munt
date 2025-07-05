"use client";

import { useEffect, useMemo } from "react";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Plus } from "lucide-react";
import { useFavoriteCoinsStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FavoriteCoins = () => {
  const { favorites, fetchFavorites } = useFavoriteCoinsStore();
  const { data: coinList } = useCoinsData(ids);
  const router = useRouter();

  // Only fetch once (you can add a 'hasFetched' flag in store if needed)
  useEffect(() => {
    if (favorites.length === 0) fetchFavorites();
  }, []);

  type Coin = {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
  };

  const getCoinData = useMemo(() => {
    if (!coinList) return () => null;
    const coinMap = new Map<string, Coin>(coinList.map((c: Coin) => [c.id, c]));
    return (coinId: string) => coinMap.get(coinId) || null;
  }, [coinList]);

  if (!favorites.length) {
    return (
      <div className="relative h-32 p-4 px-6 min-w-full flex items-center justify-between overflow-x-auto bg-zinc-950">
        <p className="text-sm text-gray-300 whitespace-nowrap">
          No favorite coins
        </p>
        <Link href="/add-coin" className="shrink-0 ml-auto">
          <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-all shadow-lg">
            <Plus className="w-6 h-6" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative h-32 p-4 px-6 min-w-full flex items-center gap-4 overflow-x-auto scroll-smooth bg-zinc-950">
      {favorites.map((coinId) => {
        const coin = getCoinData(coinId);
        if (!coin) return null;

        const isUp = coin.price_change_percentage_24h >= 0;
        const color = isUp ? "text-green-400" : "text-red-400";

        return (
          <div
            key={coinId}
            onClick={() =>
              router.push(`/dashboard/${coin.id}/${coin.symbol.toUpperCase()}`)
            }
            className="cursor-pointer flex flex-col items-center justify-center p-2 w-24 min-w-[6rem] h-full bg-black bg-opacity-40 shadow-md hover:scale-105 transition-all rounded-lg"
          >
            <Image
              src={coin.image}
              alt={coin.name}
              width={40}
              height={40}
              loading="lazy"
              className="rounded-full mb-1"
            />
            <p className="text-xs sm:text-sm font-semibold text-white">
              ${coin.current_price.toFixed(2)}
            </p>
            <p className={`text-xs font-medium ${color}`}>
              {coin.price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
        );
      })}

      {/* Add Coin button */}
      <Link href="/add-coin" className="shrink-0">
        <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-all shadow-lg z-10">
          <Plus className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
};

export default FavoriteCoins;
