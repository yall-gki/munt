"use client";

import { FC, useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle2, ArrowUpDown } from "lucide-react";

interface CryptoIndexBarProps {
  currentSort: {
    field: string;
    order: "asc" | "desc";
  };
  onSortChange: (field: string) => void;
}

const fieldMap: Record<string, string> = {
  popularity: "Popularity",
  price: "Price",
  marketCap: "Market Cap",
  rank: "Rank",
  change24h: "24h Change",
};

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({ currentSort, onSortChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleSort = (field: string) => {
    setMenuOpen(false);
    onSortChange(field);
  };

  return (
    <div className="flex items-center justify-start gap-4">
      <div className="relative inline-block text-left">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold shadow-md hover:from-blue-500 hover:to-blue-400 transition"
        >
          <ArrowUpDown className="w-4 h-4" />
          {fieldMap[currentSort.field] || "Sort"}
          {menuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {menuOpen && (
          <div className="absolute mt-2 w-48 z-30 bg-zinc-900 rounded-2xl shadow-xl p-2">
            {Object.entries(fieldMap).map(([field, label]) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-zinc-700 transition ${
                  currentSort.field === field ? "bg-zinc-800" : ""
                }`}
              >
                {label}
                {currentSort.field === field && (
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoIndexBar;
