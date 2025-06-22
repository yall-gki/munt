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
  sparkline: number[];
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
      <div className="w-full p-3 sm:p-4 mb-2 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition-all flex flex-col max-sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-white">
        {/* Top row: Coin identity */}
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

        {/* Bottom row: Chart + Data (also row on mobile) */}
        <div className="flex flex-row gap-4 sm:gap-10 items-center justify-between w-full sm:w-auto text-xs sm:text-sm font-medium">
          <MiniSparkline prices={sparkline} />
          <span className="w-24 text-right">
            ${price.toLocaleString("en-US")}
          </span>
          <span className="w-24 text-right truncate">
            {marketCap.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Coin;
