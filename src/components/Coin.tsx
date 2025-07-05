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
    <div className="w-full p-4 mb-3 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-all shadow-md text-white">
      <Link
        href={`/dashboard/${name.toLowerCase()}/${symbol.toUpperCase()}`}
        prefetch={false}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        {/* Top-left: Image + Name + Symbol */}
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

        {/* Right: Graph + Data */}
        <div className="grid grid-cols-2 sm:flex sm:gap-8 gap-y-3 sm:items-center w-full sm:w-auto text-right text-sm font-medium">
          {/* Sparkline */}
          <div className="flex flex-col items-end">
            <MiniSparkline
              prices={sparkline}
              color={isNegative ? "#ef4444" : "#22c55e"}
            />
          </div>

          {/* Price */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400">Price</span>
            <span className="text-base font-semibold">{formattedPrice}</span>
          </div>

          {/* 24h Change */}
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-400">24h</span>
            <span className={`text-base ${changeColor}`}>
              {formattedChange}
            </span>
          </div>

          {/* Market Cap */}
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
