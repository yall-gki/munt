"use client";

import Link from "next/link";
import { FC } from "react";
import Image from "next/image";
import MiniSparkline from "./MiniSparkLine";

interface CoinProps {
  id: string;
  name: string;
  price: number;
  image: string;
  marketCap: number;
  symbol: string;
  sparkline: number[]; // ✅ accepts raw array
}

const Coin: FC<CoinProps> = ({
  id,
  name,
  price,
  image,
  marketCap,
  symbol,
  sparkline,
}) => {
  return (
    <Link href={`/dashboard/${name.toLowerCase()}/${symbol.toUpperCase()}`}>
      <div className="w-full p-3 sm:p-4 mb-2 bg-zinc-800 rounded-md hover:bg-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white">
        {/* Coin Identity */}
        <div className="flex items-center gap-2">
          <Image
            src={image}
            alt={name}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full bg-white"
          />
          <div className="flex flex-col sm:flex-row sm:gap-2 items-start sm:items-center">
            <span className="font-bold text-sm">{name}</span>
            <span className="text-zinc-400 text-xs">
              {symbol.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Price, Market Cap, Chart */}
        <div className="flex flex-col sm:flex-row sm:gap-10 items-start sm:items-center w-full sm:w-auto">
          <MiniSparkline prices={sparkline} />
          <span className="w-24 text-xs sm:text-sm font-medium">
            ${price.toLocaleString("en-US")}
          </span>
          <span className="w-24 text-xs sm:text-sm truncate font-medium">
            {marketCap.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Coin;
