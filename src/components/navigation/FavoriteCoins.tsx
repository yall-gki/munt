"use client";

import { useEffect, useMemo, useState } from "react";
import { useFavoriteCoinsStore } from "@/lib/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
};

type DisplayMode = "favorites" | "portfolio" | "empty";

type BalanceBreakdownItem = {
  id: string;
  usdValue: number;
};

type BalanceValueResponse = {
  breakdown?: BalanceBreakdownItem[];
};

const FavoriteCoins = () => {
  const { favorites, fetchFavorites } = useFavoriteCoinsStore();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [mode, setMode] = useState<DisplayMode>("empty");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (favorites.length === 0) {
      fetchFavorites();
    }
  }, [favorites.length, fetchFavorites]);

  useEffect(() => {
    let active = true;

    const fetchDisplayCoins = async () => {
      setLoading(true);
      try {
        let targetIds = favorites;
        let nextMode: DisplayMode = favorites.length ? "favorites" : "empty";

        if (favorites.length === 0) {
          const balanceRes = await fetch("/api/balance/value");
          if (balanceRes.ok) {
            const balanceData: BalanceValueResponse = await balanceRes.json();
            const breakdown = Array.isArray(balanceData.breakdown)
              ? balanceData.breakdown
              : [];
            const topIds = [...breakdown]
              .sort((a, b) => b.usdValue - a.usdValue)
              .slice(0, 8)
              .map((item) => item.id);
            if (topIds.length > 0) {
              targetIds = topIds;
              nextMode = "portfolio";
            }
          }
        }

        if (targetIds.length === 0) {
          if (active) {
            setCoins([]);
            setMode("empty");
          }
          return;
        }

        const marketRes = await fetch("/api/coin-history");
        if (!marketRes.ok) throw new Error("Failed to fetch market data");
        const marketData = (await marketRes.json()) as Coin[];
        const map = new Map(targetIds.map((id, idx) => [id, idx]));

        const filtered = Array.isArray(marketData)
          ? marketData
              .filter((coin) => targetIds.includes(coin.id))
              .sort(
                (a, b) =>
                  (map.get(a.id) ?? 0) - (map.get(b.id) ?? 0)
              )
          : [];

        if (active) {
          setCoins(filtered);
          setMode(nextMode);
        }
      } catch (err) {
        console.error("❌ Failed to fetch favorite coins:", err);
        if (active) {
          setCoins([]);
          setMode("empty");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDisplayCoins();
    return () => {
      active = false;
    };
  }, [favorites]);

  const handleClick = async (targetUrl: string) => {
    try {
      const res = await fetch("/api/auth/verify");
      if (res.ok) {
        router.push(targetUrl);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  const title = useMemo(() => {
    if (mode === "portfolio") return "Top Holdings";
    if (mode === "favorites") return "Favorite Coins";
    return "";
  }, [mode]);

  if (!coins.length && !loading) {
    return (
      <div className="relative h-28 w-full flex flex-col items-center justify-center text-center bg-zinc-950 border-t border-zinc-800">
        <p className="text-xs text-zinc-400">No favorites yet.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full border-b border-zinc-800 bg-zinc-950">
      <div className="px-6 pt-3 text-xs uppercase tracking-[0.3em] text-zinc-500">
        {title}
      </div>
      <div className="relative h-28 px-6 pb-3 min-w-full flex items-center gap-4 overflow-x-auto scroll-smooth">
        {loading && (
          <div className="text-xs text-zinc-400">Loading favorites...</div>
        )}
        {coins.map((coin) => {
          const isUp = coin.price_change_percentage_24h >= 0;
          const changeClass = isUp ? "text-blue-300" : "text-rose-300";

          return (
            <div
              key={coin.id}
              onClick={() =>
                handleClick(`/dashboard/${coin.id}/${coin.symbol.toUpperCase()}`)
              }
              className="cursor-pointer group flex flex-col items-center justify-center p-2 w-24 min-w-[6rem] h-full bg-gradient-to-br from-zinc-900/70 to-blue-950/60 shadow-md hover:scale-105 transition-all rounded-xl border border-zinc-800"
            >
              <div className="relative h-9 w-9 mb-1">
                <Image
                  src={
                    coin.image ||
                    `https://cryptoicon-api.pages.dev/api/icon/${coin.symbol.toLowerCase()}`
                  }
                  alt={coin.name}
                  fill
                  sizes="36px"
                  className="rounded-full object-contain"
                />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                ${coin.current_price.toFixed(2)}
              </p>
              <p className={cn("text-xs font-medium", changeClass)}>
                {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default FavoriteCoins;
