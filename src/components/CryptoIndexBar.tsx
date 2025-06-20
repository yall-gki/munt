import { FC, useState } from "react";
import { ChevronDown } from "lucide-react";
import { sortedList } from "@/lib/sort";

interface CryptoIndexBarProps {
  sort: any;
}

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({ sort }) => {
  return (
    <div className=" h-16 w-full flex items-center justify-between p-1 px-6   text-zinc-900  ">
      <div className=" h-full flex items-center justify-start">
        <span className="flex items-center w-36  gap-2  text-sm font-semibold">
          Coin
        </span>
      </div>
      <div className="   text-right  flex justify-end sm:gap-10 text-xs sm:text-sm md:text-base font-medium max-sm:pl-8">
        <div className="h-full flex items-center ">
          <span
            onClick={() => sort("price")}
            className=" cursor-pointer text-sm w-36 flex items-center  font-semibold"
          >
            Price
            <ChevronDown className="p-1 " />
          </span>
        </div>
        <div className=" h-full  items-center ">
          <span
            onClick={() => sort("volume")}
            className="cursor-pointer  text-sm w-36 flex font-bold items-center"
          >
            Volume
            <ChevronDown className="p-1 " />
          </span>
        </div>
      </div>
    </div>
  );
};

export default CryptoIndexBar;
