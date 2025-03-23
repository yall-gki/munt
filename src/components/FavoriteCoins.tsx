"use client";
import { useEffect, useState, FC, useCallback, useMemo } from "react";
import { useCoinsData } from "@/hooks/useCoinData";
import { ids } from "@/lib/ids";
import { Plus } from "lucide-react";

const FavoriteCoins: FC = () => {
  const [favcoin, setFavcoin] = useState<{ coinId: string }[]>([]);
  const { data: cacheD } = useCoinsData(ids);

  const getFav = useCallback(async () => {
    try {
      const response = await fetch("/api/user-coin");
      const data = await response.json();
      setFavcoin(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
      setFavcoin([]);
    }
  }, []);

  useEffect(() => {
    getFav();
  }, [getFav]);

  const getCoinData = useMemo(
    () => (coinId: string) => {
      if (!cacheD) return null;
      return cacheD.find((coin: any) => coin.id === coinId) || null;
    },
    [cacheD]
  );

  return (
    <div className="relative h-32 p-4 px-6 min-w-full flex items-center gap-4 overflow-x-auto scroll-smooth">
      {/* Plus Button with White BG & Black Text */}
      <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white text-black transition-all hover:scale-110 shadow-lg z-10">
        <Plus className="relative z-20 w-6 h-6" />
      </button>

      {/* Background Gradient */}
      <span className="absolute min-w-screen inset-0 bg-[radial-gradient(circle_at_50%_100%,_#00ff99_10%,_rgba(0,0,0,0.8)_60%)] opacity-80"></span>

      {/* Favorite Coins List */}
      {favcoin.length > 0 ? (
        favcoin.map(({ coinId }) => {
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
