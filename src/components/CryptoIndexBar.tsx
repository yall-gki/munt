import { FC } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CryptoIndexBarProps {
  currentSort: {
    field: string;
    order: "asc" | "desc";
  };
  onSortChange: (field: string) => void;
}

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({
  currentSort,
  onSortChange,
}) => {
  const renderSortIcon = (field: string) => {
    if (currentSort.field !== field) return <ChevronDown size={16} />;
    return currentSort.order === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />
    );
  };

  return (
    <div className="w-full py-2 px-4 flex justify-between items-center text-white bg-zinc-900 rounded-md mb-4">
      <span className="text-sm font-semibold w-24 sm:w-36">Coin</span>
      <div className="flex gap-4 sm:gap-10 text-xs sm:text-sm font-medium">
        {["price", "volume"].map((field) => (
          <span
            key={field}
            onClick={() => onSortChange(field)}
            className={`flex items-center gap-1 cursor-pointer hover:text-green-400 ${
              currentSort.field === field ? "text-green-400" : ""
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
            {renderSortIcon(field)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CryptoIndexBar;
