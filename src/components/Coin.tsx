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

        {/* Price and Market Cap */}
        <div className="flex flex-col sm:flex-row sm:gap-10 text-xs sm:text-sm font-medium">
          <span className="w-32">${price.toLocaleString("en-US")}</span>
          <span className="w-32 truncate">
            {marketCap.toLocaleString("en-US")}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default Coin;
