"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface RawTrade {
  p: string;
  q: string;
  T: number;
  m?: boolean;
}

type TradeSide = "buy" | "sell";

interface TradeItem {
  price: number;
  quantity: number;
  time: number;
  side: TradeSide;
}

interface TradeHistoryProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ symbol, isOpen, onClose }) => {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const queueRef = useRef<TradeItem[]>([]);
  const [status, setStatus] = useState<"connecting" | "open" | "error" | "closed">(
    "connecting"
  );
  const [error, setError] = useState<string | null>(null);

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }),
    []
  );

  const qtyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6,
      }),
    []
  );

  useEffect(() => {
    if (!symbol) return;
    setStatus("connecting");
    setError(null);
    setTrades([]);
    queueRef.current = [];

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@trade`
    );

    ws.onopen = () => setStatus("open");
    ws.onerror = () => {
      setStatus("error");
      setError("Unable to connect to Binance stream.");
    };
    ws.onclose = () => {
      setStatus((prev) => (prev === "error" ? prev : "closed"));
    };

    ws.onmessage = (event) => {
      const trade: RawTrade = JSON.parse(event.data);
      const price = Number(trade.p);
      const quantity = Number(trade.q);
      if (!Number.isFinite(price) || !Number.isFinite(quantity)) return;

      const formatted: TradeItem = {
        price,
        quantity,
        time: trade.T,
        side: trade.m ? "sell" : "buy",
      };

      const last = queueRef.current[0];
      if (!last || last.price !== formatted.price || last.quantity !== formatted.quantity) {
        queueRef.current = [formatted, ...queueRef.current].slice(0, 50);
      }
    };

    return () => ws.close();
  }, [symbol]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (queueRef.current.length > 0) {
        const [next, ...rest] = queueRef.current;
        queueRef.current = rest;
        setTrades((prev) => [next, ...prev.slice(0, 24)]);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 right-0 h-full w-[380px] bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-800/90">
            <span className="font-semibold text-sm text-white">Binance Live Trades</span>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Status dot */}
          <div className="flex items-center px-4 py-2 gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                status === "open"
                  ? "bg-emerald-400"
                  : status === "connecting"
                  ? "bg-amber-400"
                  : "bg-red-400"
              )}
            />
            <span className="text-xs text-zinc-400 uppercase">{status}</span>
          </div>

          {/* Trades list */}
          <div className="flex-1 p-3 overflow-y-auto">
            <ul className="w-full">
              <li className="text-xs text-zinc-500 h-8 px-2 border-b border-zinc-700 flex justify-between font-semibold uppercase tracking-wide">
                <span className="w-1/3">Price (USDT)</span>
                <span className="w-1/3 text-center">Amount</span>
                <span className="w-1/3 text-right">Time</span>
              </li>

              {error && (
                <li className="py-6 text-sm text-zinc-400 flex items-center justify-center gap-2">
                  <WifiOff className="h-4 w-4" /> {error}
                </li>
              )}

              {!error && trades.length === 0 && (
                <li className="py-6 text-sm text-zinc-400 text-center">
                  Waiting for trades...
                </li>
              )}

              {trades.map((trade, index) => {
                const color = trade.side === "buy" ? "text-emerald-400" : "text-rose-400";
                return (
                  <li
                    key={`${trade.time}-${index}`}
                    className="text-xs h-8 px-2 border-b border-zinc-800 flex justify-between font-medium"
                  >
                    <span className={cn(color, "w-1/3 tabular-nums")}>
                      {priceFormatter.format(trade.price)}
                    </span>
                    <span className={cn(color, "w-1/3 text-center tabular-nums")}>
                      {qtyFormatter.format(trade.quantity)}
                    </span>
                    <span className={cn(color, "w-1/3 text-right tabular-nums")}>
                      {new Date(trade.time).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TradeHistory;