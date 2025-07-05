"use client";

import Link from "next/link";
import { FC, memo, useMemo, useState } from "react";
import Image from "next/image";
import MiniSparkline from "@/components/MiniSparkLine";
import { useFavoriteCoinsStore } from "@/lib/store";
import { Star, Loader2 } from "lucide-react";

interface CoinProps {
  id: string;
  name: string;
  price: number;
  image: string;
  marketCap: number;
  symbol: string;
  sparkline: number[];
  change24h: number;
}

const Coin: FC<CoinProps> = ({
  id,
  name,
  price,
  image,
  marketCap,
  symbol,
  sparkline,
  change24h,
}) => {
  const favorites = useFavoriteCoinsStore((s) => s.favorites);
  const toggleFavorite = useFavoriteCoinsStore((s) => s.toggleFavorite);
  const [loading, setLoading] = useState(false);

  const isFavorited = favorites.includes(id);
  const isNegative = useMemo(() => change24h < 0, [change24h]);
  const changeColor = isNegative ? "text-red-500" : "text-green-400";
  const formattedPrice = `$${price?.toLocaleString("en-US") || "0.00"}`;
  const formattedMarketCap = marketCap?.toLocaleString("en-US") || "0";
  const formattedChange = `${change24h?.toFixed(2) || "0.00"}%`;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await toggleFavorite(id);
    setLoading(false);
  };

  return (
    <div className="relative w-full p-4 mb-4 rounded-2xl overflow-hidden bg-zinc-950 text-white group hover:bg-zinc-900 transition-all shadow-sm">
      {/* SVG background */}
      <div
        className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity"
        style={{
          backgroundImage: "url('/haikei-list.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Link
        href={`/dashboard/${name.toLowerCase()}/${symbol.toUpperCase()}`}
        prefetch={false}
        className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        {/* Left: Icon + Name */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Image
            src={image}
            alt={name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full bg-white"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base">{name}</span>
              <button
                onClick={handleToggle}
                className="transition-all text-blue-500 hover:text-blue-400"
                title={isFavorited ? "Unfavorite" : "Favorite"}
              >
                {loading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  <Star
                    className="w-4 h-4"
                    stroke="currentColor"
                    fill={isFavorited ? "currentColor" : "none"}
                    strokeWidth={2}
                  />
                )}
              </button>
            </div>
            <span className="text-xs uppercase text-zinc-400">{symbol}</span>
          </div>
        </div>

        {/* Right: Sparkline + Data */}
        <div className="grid grid-cols-2 sm:flex sm:gap-8 gap-y-3 sm:items-center w-full sm:w-auto text-right text-sm font-medium">
          <div className="flex flex-col items-end">
            <MiniSparkline
              prices={sparkline}
              color={isNegative ? "#ef4444" : "#3b82f6"} // red or blue
            />
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400">Price</span>
            <span className="text-base font-semibold">{formattedPrice}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400">24h</span>
            <span className={`text-base ${changeColor}`}>
              {formattedChange}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400">M. Cap</span>
            <span className="text-base">{formattedMarketCap}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default memo(Coin);
