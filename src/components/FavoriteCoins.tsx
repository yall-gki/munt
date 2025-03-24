"use client";
import { useEffect, useMemo, FC } from "react";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Plus } from "lucide-react";
import { useFavoriteCoinsStore } from "@/lib/store"; // ✅ Import Global Store

const FavoriteCoins: FC = () => {
  const { favorites, fetchFavorites } = useFavoriteCoinsStore(); // ✅ Use global favorites state
  const { data: cacheD } = useCoinsData(ids);

  // Fetch user's favorite coins on mount
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
    <div className="relative h-32 p-4 px-6 min-w-full flex items-center gap-4 overflow-x-auto scroll-smooth">
      {/* Plus Button */}
      <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 shadow-lg z-10">
        <Plus className="relative z-20 w-6 h-6" />
      </button>

      {/* Background Gradient */}
      {/* Background Gradient */}
      {/* Background Gradient */}
      <span className="absolute left-0 top-0 h-full w-[300%] min-w-[max-content] bg-[radial-gradient(circle_at_50%_100%,_#00ff99_10%,_rgba(0,0,0,0.8)_60%)] opacity-80 pointer-events-none"></span>

      {/* Favorite Coins List */}
      {favorites.length > 0 ? (
        favorites.map((coinId) => {
          const coinData = getCoinData(coinId);
          if (!coinData) return null;

          return (
            <div
              key={coinId}
              className="relative flex flex-col items-center justify-center p-2 w-24 min-w-[6rem] h-full bg-black bg-opacity-40 shadow-md hover:scale-105 transition-all rounded-lg"
            >
              <img
                className="rounded-full w-10 h-10 mb-1"
                src={coinData.image}
                alt={coinId}
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
    </div>
  );
};

export default FavoriteCoins;
