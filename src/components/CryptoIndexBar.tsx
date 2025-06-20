import { FC } from "react";
import { ChevronDown } from "lucide-react";

interface CryptoIndexBarProps {
  sort: (order: string) => void;
}

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({ sort }) => {
  return (
    <div className="w-full py-2 px-4 flex justify-between items-center text-white bg-zinc-900 rounded-md mb-4">
      <span className="text-sm font-semibold w-24 sm:w-36">Coin</span>
      <div className="flex gap-4 sm:gap-10 text-xs sm:text-sm font-medium">
        <span
          onClick={() => sort("price")}
          className="flex items-center gap-1 cursor-pointer hover:text-green-400"
        >
          Price <ChevronDown size={16} />
        </span>
        <span
          onClick={() => sort("volume")}
          className="flex items-center gap-1 cursor-pointer hover:text-green-400"
        >
          Volume <ChevronDown size={16} />
        </span>
      </div>
    </div>
  );
};

export default CryptoIndexBar;
