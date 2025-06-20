import Link from "next/link";
import { FC } from "react";
import Image from "next/image";

interface CoinProps {
  name: string;
  price: number;
  image: string;
  marketCap: number;
  symbol: string;
}

const Coin: FC<CoinProps> = ({ image, name, price, marketCap, symbol }) => {
  return (
    <Link href={`/dashboard/${name.toLowerCase()}/${symbol.toUpperCase()}`}>
      <div className="w-full hover:bg-slate-50 border-2 border-zinc-100 p-2 sm:p-4 flex flex-col max-sm:gap-2 sm:flex-row sm:justify-between sm:items-center">
        {/* Top row: Name + Symbol */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 max-sm:pl-2">
          {/* Coin Name and Symbol */}
          <span className="font-bold text-xs sm:text-sm md:text-base truncate">
            {name}
          </span>
          <span className="font-medium text-xs sm:text-sm text-zinc-400">
            {symbol.toUpperCase()}
          </span>
        </div>

        {/* Bottom row: Price and Market Cap */}
        <div className="flex flex-col sm:flex-row sm:gap-10 text-xs sm:text-sm md:text-base font-medium max-sm:pl-8">
          <div className="w-36">${price.toLocaleString("en-US")}</div>
          <div className="truncate w-36">{marketCap.toLocaleString("en-US")}</div>
        </div>
      </div>
    </Link>
  );
};

export default Coin;
