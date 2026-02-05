"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LiveTicker from "@/components/Ticker";
import { useQueryClient } from "@tanstack/react-query";
import { ids } from "@/lib/ids";
import { useFavoriteCoinsStore } from "@/lib/store";
import { useStrategyStore } from "@/lib/strategyStore";
import { Activity, LineChart, Sparkles, Wallet } from "lucide-react";

// Inside return()

type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  image?: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
};

export default function Home() {
  const queryClient = useQueryClient();
  const setStrategies = useStrategyStore((s) => s.setStrategies);
  const setFavorites = useFavoriteCoinsStore((s) => s.setFavorites);
  const [market, setMarket] = useState<MarketCoin[]>([]);

  useEffect(() => {
    let active = true;
    const prefetch = async () => {
      const [marketRes, favoritesRes, strategiesRes, balancesRes, tradesRes] =
        await Promise.allSettled([
          fetch("/api/coin-history"),
          fetch("/api/user-coin"),
          fetch("/api/strategies"),
          fetch("/api/balance/value"),
          fetch("/api/trades"),
        ]);

      if (marketRes.status === "fulfilled" && marketRes.value.ok) {
        const data = (await marketRes.value.json()) as MarketCoin[];
        if (active && Array.isArray(data)) {
          setMarket(data);
          queryClient.setQueryData(["coinsData", ids],
            data.filter((coin) => ids.includes(coin.id))
          );
        }
      }

      if (favoritesRes.status === "fulfilled" && favoritesRes.value.ok) {
        const favs = await favoritesRes.value.json();
        if (active && Array.isArray(favs)) {
          const idsList = favs.map((item: any) => item.coinId).filter(Boolean);
          if (typeof setFavorites === "function") {
            setFavorites(idsList);
          }
        }
      }

      if (strategiesRes.status === "fulfilled" && strategiesRes.value.ok) {
        const strat = await strategiesRes.value.json();
        if (active && Array.isArray(strat?.strategies)) {
          setStrategies(strat.strategies);
        }
      }

      if (balancesRes.status === "fulfilled" && balancesRes.value.ok) {
        const balances = await balancesRes.value.json();
        queryClient.setQueryData(["balanceValue"], balances);
        const firstCoin = balances?.breakdown?.[0]?.id;
        if (firstCoin) {
          fetch(`/api/portfolio/history/${firstCoin}`).catch(() => null);
        }
      }

      if (tradesRes.status === "fulfilled" && tradesRes.value.ok) {
        const trades = await tradesRes.value.json();
        queryClient.setQueryData(["trades"], trades);
      }
    };

    prefetch();
    return () => {
      active = false;
    };
  }, [queryClient, setStrategies, setFavorites]);

  const featured = useMemo(() => market.slice(0, 3), [market]);
  const trackedCount = market.length || ids.length;

  return (
    <div className="relative w-full min-h-[calc(92vh-8rem)] overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.12),_transparent_40%)]" />

      <div className="relative z-20 px-6 py-12">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl font-extrabold leading-tight"
            >
              Track crypto with precision on{" "}
              <span className="text-blue-500">Munt</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-lg sm:text-xl text-zinc-300 max-w-xl"
            >
              Your all-in-one crypto dashboard to monitor prices, manage
              strategies, and see your portfolio evolve in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/dashboard">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-full transition-all shadow-[0_0_18px_rgba(59,130,246,0.5)]">
                  Go to Dashboard
                </button>
              </Link>
              <Link href="/wallet">
                <button className="px-6 py-3 bg-zinc-900 border border-blue-500/40 text-blue-200 text-lg font-semibold rounded-full hover:bg-blue-500/10 transition-all">
                  View Portfolio
                </button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Tracked Coins
                </p>
                <p className="text-2xl font-semibold text-blue-300">
                  {trackedCount}+
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Strategy Tools
                </p>
                <p className="text-2xl font-semibold text-blue-300">Live</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Portfolio Mode
                </p>
                <p className="text-2xl font-semibold text-blue-300">Ready</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/80 to-blue-950/50 p-6 shadow-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                Featured Markets
              </p>
              <div className="mt-4 space-y-3">
                {featured.map((coin) => (
                  <div
                    key={coin.id}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-950/60 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </p>
                      <p className="text-xs text-zinc-400">
                        ${coin.current_price.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        coin.price_change_percentage_24h >= 0
                          ? "text-blue-300"
                          : "text-rose-300"
                      }`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: LineChart,
                  title: "Live Charts",
                  copy: "Candles, indicators, and trades in one view.",
                },
                {
                  icon: Wallet,
                  title: "Wallet View",
                  copy: "See holdings, history, and performance instantly.",
                },
                {
                  icon: Sparkles,
                  title: "Strategy Lab",
                  copy: "Design strategies with limits and safeguards.",
                },
                {
                  icon: Activity,
                  title: "Trade Logs",
                  copy: "Follow executions and recent activity.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <item.icon className="h-4 w-4 text-blue-300" />
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-20 w-full border-t border-zinc-800">
        <LiveTicker />
      </div>
    </div>
  );
}
