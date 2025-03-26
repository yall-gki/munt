import Link from "next/link";
import { FC } from "react";

interface CoinProps {
  name: string;
  price: number;
  image: string;

  symbol: string;
}

const MiniCoin: FC<CoinProps> = ({ image, name, price, symbol }) => {
  return (
    <div className="w-full hover:bg-slate-50 h-16 flex items-center justify-between p-2 sm:p-4 ">
      <div className="flex items-center gap-2 w-1/3">
        <img src={image} className="h-6 w-6 object-cover" alt={name} />
        <span className="font-bold text-xs  sm:text-sm md:text-base truncate">
          {name}
        </span>
        <span className="font-medium text-xs  sm:text-sm text-zinc-400">
          {symbol.toUpperCase()}
        </span>
      </div>

      <div className="text-xs sm:text-sm w-1/3 md:text-base font-medium">
        ${price.toLocaleString("en-US")}
      </div>
    </div>
  );
};

export default MiniCoin;
