"use client";

import { useState } from "react";
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (coinId: string) => {
    setTogglingId(coinId);
    await new Promise((res) => setTimeout(res, 500)); // simulate delay if needed
    toggleFavorite(coinId);
    setTogglingId(null);
  };

  return (
    <div className="relative w-full p-4 pt-6 flex flex-col min-h-full items-center  text-white ">
      {!cacheD ? (
        <div className="flex justify-center items-center h-32">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
          {cacheD?.map((coin: any) => {
            const isFav = favorites.includes(coin.id);
            const isToggling = togglingId === coin.id;

            return (
              <button
                key={coin.id}
                onClick={() => handleToggle(coin.id)}
                disabled={isToggling}
                className={cn(
                  "flex items-center gap-3  transition p-3 rounded-lg shadow-sm w-full",

                  isToggling && "opacity-70 cursor-not-allowed"
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
                      isFav ? "text-white" : "text-zinc-200"
                    )}
                  >
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isFav ? "text-white/80" : "text-zinc-400"
                    )}
                  >
                    ${coin.current_price.toFixed(2)}
                  </span>
                </div>

                {isToggling ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Star
                    size={20}
                    fill={isFav ? "#3b82f6" : "none"}
                    className={cn(
                      "transition",
                      isFav ? "text-blue-500" : "text-zinc-400"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Oinli;
