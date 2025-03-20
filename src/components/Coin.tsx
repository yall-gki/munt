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
      {" "}
      <div className="w-screen hover:bg-slate-50 h-16 flex items-center justify-between p-1 px-6 border-2 border-b-1 border-l-4 border-r-4  border-zinc-100">
        <div className="w-[10rem] h-full flex items-center justify-start">
          <span
            className="flex items-center justify-center gap-2 
            "
          >
            <img src={image} className="h-6 w-6 object-cover " alt="" />
            <span className="font-bold text-xs">{name}</span>
            <span className="font-medium text-sm text-zinc-400 ">
              {symbol.toUpperCase()}
            </span>
          </span>
        </div>
        <div className="w-20 h-full flex items-center justify-start"></div>

        <div className="w-20 h-full flex items-center justify-start">
          <span className="text-sm font-medium">
            ${price.toLocaleString("en-US")}
          </span>
        </div>
        <div className="w-[10rem] h-full flex items-center justify-start">
          <span className="text-sm font-medium">
            {marketCap.toLocaleString("en-US")}
          </span>
        </div>

        {/* Any other necessary elements */}
      </div>
    </Link>
  );
};

export default Coin;
