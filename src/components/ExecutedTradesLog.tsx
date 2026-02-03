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
          <div className="grid grid-cols-6 text-xs uppercase tracking-wide text-zinc-500">
            <span>Pair</span>
            <span className="text-right">Sold</span>
            <span className="text-right">Received</span>
            <span className="text-right">Rate</span>
            <span className="text-right">Status</span>
            <span className="text-right">Time</span>
          </div>
          {trades.map((trade) => {
            const rate = trade.fromPrice > 0 && trade.toPrice > 0
              ? (trade.fromPrice / trade.toPrice).toFixed(6)
              : "-";
            const statusLabel = trade.status?.toLowerCase?.() === "failed" ? "Failed" : "Completed";
            return (
              <div
                key={trade.id}
                className="grid grid-cols-6 items-center text-sm border-b border-zinc-800 pb-2"
              >
                <div className="font-semibold">
                  {trade.fromCoin.symbol.toUpperCase()} → {trade.toCoin.symbol.toUpperCase()}
                </div>
                <div className="text-right tabular-nums">
                  {trade.fromAmount.toFixed(6)}
                </div>
                <div className="text-right tabular-nums text-emerald-400">
                  {trade.toAmount.toFixed(6)}
                </div>
                <div className="text-right tabular-nums text-zinc-300">
                  {rate}
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-[10px] uppercase tracking-wide",
                      statusLabel === "Completed"
                        ? "bg-emerald-500/10 text-emerald-300"
                        : "bg-rose-500/10 text-rose-300"
                    )}
                  >
                    {statusLabel}
                  </span>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  {timeFormatter.format(new Date(trade.executedAt))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
