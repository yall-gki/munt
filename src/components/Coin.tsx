import Link from "next/link";
import { FC } from "react";

interface CoinProps {
  name: string;
  price: number;
  image: string;
  marketCap: number;
  symbol: string;
}

const Coin: FC<CoinProps> = ({ image, name, price, marketCap, symbol }) => {
  return (
    <Link href={`/dashboard/${name.toLowerCase()}`}>
      <div className="w-full hover:bg-slate-50 h-16 flex flex-wrap items-center justify-between p-2 sm:p-4 border-2 border-b-1 border-l-4 border-r-4 border-zinc-100">
        <div className="flex items-center gap-2 w-36">
          <img src={image} className="h-6 w-6 object-cover" alt={name} />
          <span className="font-bold text-xs  sm:text-sm md:text-base truncate">
            {name}
          </span>
          <span className="font-medium text-xs  sm:text-sm text-zinc-400">
            {symbol.toUpperCase()}
          </span>
        </div>

        <div className="text-xs sm:text-sm w-36 md:text-base font-medium">
          ${price.toLocaleString("en-US")}
        </div>

        <div className="text-xs sm:text-sm w-36 md:text-base font-medium truncate">
          {marketCap.toLocaleString("en-US")}
        </div>
      </div>
    </Link>
  );
};

export default Coin;
