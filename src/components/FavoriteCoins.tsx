"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useFavoriteCoinsStore } from "@/lib/store";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Coin type for prices from backend
type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
};

const FavoriteCoins = () => {
  const { favorites, fetchFavorites } = useFavoriteCoinsStore();
  const [prices, setPrices] = useState<Record<string, Coin>>({});
  const router = useRouter();

  // Fetch latest prices from backend
  const fetchPrices = async () => {
    try {
      const res = await fetch("https://munt-api.onrender.com/all-prices");
      if (!res.ok) throw new Error("Failed to fetch prices");
      const data = await res.json(); // { bitcoin: 30000, ethereum: 2000, ... }

      // Map favorites to Coin objects
      const coinsMap: Record<string, Coin> = {};
      favorites.forEach((id) => {
        const price = data[id] ?? 0;
        coinsMap[id] = {
          id,
          symbol: id.toUpperCase(),
          name: id,
          image: `/coins/${id}.png`, // adjust if you have actual images
          current_price: price,
          price_change_percentage_24h: 0, // placeholder, can calculate if you have historical data
        };
      });

      setPrices(coinsMap);
    } catch (err) {
      console.error("❌ Failed to fetch latest prices:", err);
      setPrices({});
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (favorites.length > 0) {
      fetchPrices();
    }
  }, [favorites]);

  const handleClick = async (targetUrl: string) => {
    try {
      const res = await fetch("/api/auth/verify");
      if (res.ok) {
        router.push(targetUrl);
      } else {
        router.push("/sign-in");
      }
    } catch {
      router.push("/sign-in");
    }
  };

  const getCoinData = useMemo(() => {
    if (!favorites.length || !prices) return () => null;
    return (coinId: string) => prices[coinId] || null;
  }, [favorites, prices]);

  if (!favorites.length) {
    return (
      <div className="relative h-32 w-full flex flex-col items-center justify-center text-center bg-zinc-950 border-t border-zinc-800">
        <button
          onClick={() => handleClick("/add-coin")}
          className="mt-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 inline mr-1" /> Add Coins
        </button>
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
              handleClick(`/dashboard/${coin.id}/${coin.symbol.toUpperCase()}`)
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
      <button
        onClick={() => handleClick("/add-coin")}
        className="relative w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-all shadow-lg z-10"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default FavoriteCoins;
