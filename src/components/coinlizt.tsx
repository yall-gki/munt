"use client";

import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { useFavoriteCoinsStore } from "@/lib/store";
import { Star } from "lucide-react";
import CloseModal from "./CloseModal";
import Image from "next/image";
import { cn } from "@/lib/utils";

const Oinli = () => {
  const { data: cacheD } = useCoinsData(ids);
  const { favorites, toggleFavorite } = useFavoriteCoinsStore();

  return (
    <div className="relative w-full p-4 pt-6 flex flex-col items-center">
      <div className="absolute top-2 right-2">
        <CloseModal />
      </div>

      <h2 className="text-xl font-semibold mb-4 text-zinc-700 dark:text-white">
        Add a Coin
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {cacheD?.map((coin: any) => {
          const isFav = favorites.includes(coin.id);

          return (
            <button
              key={coin.id}
              onClick={() => toggleFavorite(coin.id)}
              className={cn(
                "flex items-center gap-3 transition p-3 rounded-md shadow-sm w-full",
                isFav
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
              )}
            >
              <Image
                src={coin.image}
                alt={coin.name}
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="flex flex-col items-start flex-1">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isFav ? "text-white" : "text-zinc-800"
                  )}
                >
                  {coin.name} ({coin.symbol.toUpperCase()})
                </span>
                <span
                  className={cn(
                    "text-xs",
                    isFav ? "text-white/80" : "text-zinc-500"
                  )}
                >
                  ${coin.current_price.toFixed(2)}
                </span>
              </div>
              <Star
                size={20}
                fill={isFav ? "#FFD700" : "none"}
                className={cn(
                  "transition",
                  isFav ? "text-yellow-400" : "text-zinc-400"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Oinli;
