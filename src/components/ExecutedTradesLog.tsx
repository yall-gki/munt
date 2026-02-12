"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

interface TradeItem {
  id: string;
  fromAmount: number;
  toAmount: number;
  fromPrice: number;
  toPrice: number;
  status: string;
  executedAt: string;
  fromCoinId?: string;
  toCoinId?: string;
  fromCoin: { symbol: string; name: string };
  toCoin: { symbol: string; name: string };
}

type ExecutedTradesLogProps = {
  coinId?: string;
  refreshKey?: number;
};

export default function ExecutedTradesLog({ coinId, refreshKey }: ExecutedTradesLogProps) {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  const fetchTrades = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", "25");
      if (coinId) params.set("coin", coinId);
      const res = await axios.get(`/api/trades?${params.toString()}`);
      setTrades(res.data.trades || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load trade history");
    } finally {
      setLoading(false);
    }
  }, [coinId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades, refreshKey]);

  return (
    <div className="w-full bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Executed Trades
          </p>
          <p className="text-sm text-zinc-200 font-semibold">
            {coinId ? "Recent swaps for this asset" : "Recent wallet swaps"}
          </p>
        </div>
        <button
          onClick={fetchTrades}
          className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
          aria-label="Refresh trades"
        >
          <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading trades...</div>
      ) : error ? (
        <div className="text-sm text-rose-400">{error}</div>
      ) : trades.length === 0 ? (
        <div className="text-sm text-zinc-400">No trades yet.</div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-5 text-xs uppercase tracking-wide text-zinc-500">
            <span>Date</span>
            <span>Coin</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Price USD</span>
            <span className="text-right">Total USD</span>
          </div>
          {trades.map((trade) => {
            const isCoinContext =
              coinId &&
              (trade.fromCoinId === coinId || trade.toCoinId === coinId);
            const isSell = isCoinContext
              ? trade.fromCoinId === coinId
              : true;
            const sideLabel = isSell ? "Sell" : "Buy";
            const coinLabel = isCoinContext
              ? isSell
                ? trade.fromCoin.symbol.toUpperCase()
                : trade.toCoin.symbol.toUpperCase()
              : `${trade.fromCoin.symbol.toUpperCase()} → ${trade.toCoin.symbol.toUpperCase()}`;
            const amount = isCoinContext
              ? isSell
                ? trade.fromAmount
                : trade.toAmount
              : trade.fromAmount;
            const price = isCoinContext
              ? isSell
                ? trade.fromPrice
                : trade.toPrice
              : trade.fromPrice;
            const total = amount * price;
            const sideColor = isSell ? "text-rose-400" : "text-emerald-400";
            return (
              <div
                key={trade.id}
                className="grid grid-cols-5 items-center text-sm border-b border-zinc-800 pb-2"
              >
                <div className="text-xs text-zinc-400">
                  {timeFormatter.format(new Date(trade.executedAt))}
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border",
                      isSell
                        ? "border-rose-500/40 text-rose-300"
                        : "border-emerald-500/40 text-emerald-300"
                    )}
                  >
                    {sideLabel}
                  </span>
                  <span>{coinLabel}</span>
                </div>
                <div className={cn("text-right tabular-nums", sideColor)}>
                  {amount.toFixed(6)}
                </div>
                <div className="text-right tabular-nums text-zinc-300">
                  ${price.toFixed(2)}
                </div>
                <div className="text-right tabular-nums text-zinc-200">
                  ${total.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
