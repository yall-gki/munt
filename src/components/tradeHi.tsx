"use client";

import { useEffect, useState, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Trade {
  p: string; // price
  q: string; // quantity
  T: number; // timestamp
}

const TradeHistory: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [queue, setQueue] = useState<Trade[]>([]);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const queueRef = useRef<Trade[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol}usdt@trade`
    );

    ws.onmessage = (event) => {
      const trade: Trade = JSON.parse(event.data);
      const last = queueRef.current[0];

      // avoid duplicate price & quantity
      if (!last || trade.p !== last.p || trade.q !== last.q) {
        queueRef.current = [trade, ...queueRef.current];
        setQueue([...queueRef.current]);
      }
    };

    return () => ws.close();
  }, [symbol]);

  // Throttle updates every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (queueRef.current.length > 0) {
        const [next, ...rest] = queueRef.current;
        queueRef.current = rest;
        setQueue([...rest]);

        setTrades((prev) => [next, ...prev.slice(0, 19)]);
        setPrevPrice(parseFloat(next.p));
      }
    }, 500); // 👈 adjust this delay for speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-900 rounded-xl text-white overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-3 flex items-center justify-between bg-zinc-800 border-b border-zinc-700"
      >
        <span className="font-semibold text-sm">Trade History</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <ul className="w-full">
                <li className="text-sm text-zinc-500 h-8 px-4 border-b border-zinc-700 flex justify-between font-bold">
                  <span className="w-1/3">Price</span>
                  <span className="w-1/3">Amount</span>
                  <span className="w-1/3 text-right">Time</span>
                </li>

                {trades.map((trade, index) => {
                  const price = parseFloat(trade.p);
                  const quantity = parseFloat(trade.q);
                  const color =
                    prevPrice === null
                      ? "text-white"
                      : price > prevPrice
                      ? "text-[#0ecb81]" // green
                      : price < prevPrice
                      ? "text-[#f6465d]" // red
                      : "text-white";

                  return (
                    <li
                      key={`${trade.T}-${index}`}
                      className="text-xs h-8 px-4 border-b border-zinc-700 flex justify-between font-bold"
                    >
                      <span className={`${color} w-1/3`}>
                        {price.toFixed(4)}
                      </span>
                      <span className={`${color} w-1/3`}>
                        {quantity.toFixed(6)}
                      </span>
                      <span className={`${color} w-1/3 text-right`}>
                        {new Date(trade.T).toLocaleTimeString()}
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
