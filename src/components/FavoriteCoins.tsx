"use client";

import { useEffect, useMemo, FC } from "react";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Plus } from "lucide-react";
import { useFavoriteCoinsStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FavoriteCoins: FC = () => {
  const { favorites, fetchFavorites } = useFavoriteCoinsStore();
  const { data: cacheD } = useCoinsData(ids);
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const getCoinData = useMemo(
    () => (coinId: string) => {
      if (!cacheD) return null;
      return cacheD.find((coin: any) => coin.id === coinId) || null;
    },
    [cacheD]
  );

  return (
    <div className="relative h-32 p-4 px-6 min-w-full flex items-center gap-4 overflow-x-auto scroll-smooth bg-zinc-950">
      {favorites.length > 0 ? (
        favorites.map((coinId) => {
          const coinData = getCoinData(coinId);
          if (!coinData) return null;

          return (
            <div
              key={coinId}
              onClick={() =>
                router.push(
                  `/dashboard/${coinData.id}/${coinData.symbol.toUpperCase()}`
                )
              }
              className="cursor-pointer relative flex flex-col items-center justify-center p-2 w-24 min-w-[6rem] h-full bg-black bg-opacity-40 shadow-md hover:scale-105 transition-all rounded-lg"
            >
              <Image
                src={coinData.image}
                alt={coinId}
                width={40}
                height={40}
                className="rounded-full mb-1"
              />
              <p className="text-xs sm:text-sm font-semibold text-white">
                ${coinData.current_price.toFixed(2)}
              </p>
              <p
                className={`text-xs font-medium ${
                  coinData.price_change_percentage_24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {coinData.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-300 z-10 whitespace-nowrap">
          No favorite coins
        </p>
      )}

      <Link
        href="/add-coin"
        className="hover:text-zinc-800 text-sm font-bold underline underline-offset-6"
      >
        <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 shadow-lg z-10">
          <Plus className="relative z-20 w-6 h-6" />
        </button>
      </Link>
    </div>
  );
};

export default FavoriteCoins;
