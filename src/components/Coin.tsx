"use client";

import Link from "next/link";
import { FC, memo } from "react";
import Image from "next/image";
import MiniSparkline from "./MiniSparkLine";

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
  const isNegative = change24h < 0;
  const changeColor = isNegative ? "text-red-500" : "text-green-400";

  return (
    <Link href={`/dashboard/${name.toLowerCase()}/${symbol.toUpperCase()}`}>
      <div className="w-full p-3 sm:p-4 mb-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all flex max-sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-white">
        {/* Coin identity */}
        <div className="flex items-center gap-3">
          <Image
            src={image}
            alt={name}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full bg-white"
          />
          <div className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center">
            <span className="font-bold text-sm">{name}</span>
            <span className="text-zinc-400 text-xs">
              {symbol.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Chart and data */}
        <div className="flex flex-row gap-4 sm:gap-10 items-center max-sm:items-end max-sm:justify-end justify-between w-full sm:w-auto text-xs sm:text-sm font-medium">
          <MiniSparkline
            prices={sparkline}
            color={isNegative ? "#ef4444" : "#22c55e"}
          />

          {/* Price + 24h change */}
          <div className="flex flex-col w-24 text-right">
            <span className="max-sm:font-semibold text-base">
              ${price.toLocaleString("en-US")}
            </span>
            <span className={`sm:hidden text-xs ${changeColor}`}>
              {change24h.toFixed(2)}%
            </span>
          </div>

          {/* Market cap + 24h change for desktop */}
          <div className="hidden sm:flex flex-col text-right w-24 truncate">
            <span>{marketCap.toLocaleString("en-US")}</span>
            <span className={`${changeColor} text-xs`}>
              {change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default memo(Coin);
