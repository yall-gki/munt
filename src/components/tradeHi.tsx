"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, WifiOff } from "lucide-react";
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

const TradeHistory: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const queueRef = useRef<TradeItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
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
    <div className="w-full bg-zinc-900 rounded-xl text-white overflow-hidden border border-zinc-800">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between bg-zinc-800/70 border-b border-zinc-700"
      >
        <span className="font-semibold text-sm">Binance Live Trades</span>
        <div className="flex items-center gap-2">
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
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="p-3 max-h-[340px] overflow-y-auto">
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
    </div>
  );
};

export default TradeHistory;
