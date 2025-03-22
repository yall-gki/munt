import { FC, useState } from "react";
import { ChevronDown } from "lucide-react";
import { sortedList } from "@/lib/sort";

interface CryptoIndexBarProps {
  sort: any;
}

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({ sort }) => {
  return (
    <div className=" h-16 w-screen flex items-center justify-between p-1 px-6   text-zinc-900  ">
      <div className="w-[10rem] h-full flex items-center justify-start">
        <span className="flex items-center justify-center gap-2  text-sm font-semibold">
          Coin
        </span>
      </div>
      <div className="w-20 h-full flex items-center justify-start"></div>

      <div className="w-20 h-full flex items-center justify-start">
        <span
          onClick={() => sort("price")}
          className=" cursor-pointer text-sm flex items-center justify-start font-semibold"
        >
          Price
          <ChevronDown className="p-1 " />
        </span>
      </div>
      <div className="w-[10rem] h-full flex items-center justify-start">
        <span
          onClick={() => sort("volume")}
          className="cursor-pointer text-sm flex font-bold items-center justify-start"
        >
          Volume
          <ChevronDown className="p-1 " />
        </span>
      </div>
    </div>
  );
};

export default CryptoIndexBar;
