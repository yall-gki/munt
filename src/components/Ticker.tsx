"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface Price {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  color: string;
}

export default function LiveTicker() {
  const [prices, setPrices] = useState<Record<string, Price>>({
    btc: {
      symbol: "BTC",
      name: "Bitcoin",
      icon: "",
      price: 0,
      color: "text-yellow-400",
    },
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      icon: "",
      price: 0,
      color: "text-blue-400",
    },
  });

  // 🟡 Fetch icons from CoinGecko
  useEffect(() => {
    const fetchIcons = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum"
        );
        const data = await res.json();

        const updated = { ...prices };
        for (const coin of data) {
          const key = coin.symbol.toLowerCase();
          if (updated[key]) {
            updated[key].icon = coin.image;
          }
        }

        setPrices(updated);
      } catch (err) {
        console.error("Icon fetch failed:", err);
      }
    };

    fetchIcons();
  }, []);

  // 🔹 Preload price before WebSocket connects
  useEffect(() => {
    const preloadPrices = async () => {
      try {
        const res = await fetch(
          'https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]'
        );
        const data = await res.json();

        setPrices((prev) => ({
          ...prev,
          btc: {
            ...prev.btc,
            price: parseFloat(
              data.find((d: any) => d.symbol === "BTCUSDT")?.price || "0"
            ),
          },
          eth: {
            ...prev.eth,
            price: parseFloat(
              data.find((d: any) => d.symbol === "ETHUSDT")?.price || "0"
            ),
          },
        }));
      } catch (err) {
        console.error("Initial price fetch failed:", err);
      }
    };

    preloadPrices();
  }, []);

  // 🔁 Live updates via WebSocket
  useEffect(() => {
    const ws = new WebSocket(
      "wss://stream.binance.com:9443/stream?streams=btcusdt@ticker/ethusdt@ticker"
    );

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message?.data) return;

      const symbol = message.data.s;
      const price = parseFloat(message.data.c); // current price

      if (symbol === "BTCUSDT") {
        setPrices((prev) => ({
          ...prev,
          btc: { ...prev.btc, price },
        }));
      }

      if (symbol === "ETHUSDT") {
        setPrices((prev) => ({
          ...prev,
          eth: { ...prev.eth, price },
        }));
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="w-full flex justify-center gap-4 px-4 py-4 bg-zinc-950 border-t border-zinc-800">
      {Object.entries(prices).map(([key, coin]) => (
        <div
          key={key}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-zinc-900 shadow-sm border border-zinc-800 min-w-[130px] justify-center"
        >
          {coin.icon ? (
            <Image
              src={coin.icon}
              alt={coin.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          <div className="flex flex-col items-start text-xs sm:text-sm">
            <span className="text-zinc-400">{coin.symbol}</span>
            <span className={`font-semibold ${coin.color}`}>
              {coin.price ? `$${coin.price.toLocaleString()}` : "..."}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
