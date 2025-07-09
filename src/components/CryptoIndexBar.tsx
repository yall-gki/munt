"use client";

import { FC, useState } from "react";
import { ChevronDown, ChevronUp, ListFilter, CheckCircle2 } from "lucide-react";

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
};

const CryptoIndexBar: FC<CryptoIndexBarProps> = ({
  currentSort,
  onSortChange,
}) => {
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
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          <ListFilter className="w-4 h-4" />
          {fieldMap[currentSort.field] || "Sort"}
          {menuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {menuOpen && (
          <div className="absolute mt-2 w-48 z-20 bg-zinc-900 rounded-xl shadow-lg p-2">
            {Object.entries(fieldMap).map(([field, label]) => (
              <button
                key={field}
                onClick={() => toggleSort(field)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-zinc-700 transition ${
                  currentSort.field === field ? "bg-zinc-700" : ""
                }`}
              >
                {label}
                {currentSort.field === field && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
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
