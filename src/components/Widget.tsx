"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Coins, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavoriteCoinsStore } from "@/lib/store";
import axios from "axios";
import { toast } from "sonner"; // or use any toast system

const coins = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "cardano", symbol: "ADA" },
  { id: "xrp", symbol: "XRP" },
  { id: "polkadot", symbol: "DOT" },
  { id: "uniswap", symbol: "UNI" },
  { id: "chainlink", symbol: "LINK" },
  { id: "litecoin", symbol: "LTC" },
  { id: "stellar", symbol: "XLM" },
  { id: "usdc", symbol: "USDC" },
  { id: "dogecoin", symbol: "DOGE" },
  { id: "vechain", symbol: "VET" },
  { id: "filecoin", symbol: "FIL" },
  { id: "tron", symbol: "TRX" },
  { id: "eos", symbol: "EOS" },
  { id: "aave", symbol: "AAVE" },
  { id: "monero", symbol: "XMR" },
  { id: "cosmos", symbol: "ATOM" },
  { id: "tezos", symbol: "XTZ" },
  { id: "algorand", symbol: "ALGO" },
  { id: "nem", symbol: "XEM" },
  { id: "compound", symbol: "COMP" },
  { id: "kusama", symbol: "KSM" },
  { id: "zilliqa", symbol: "ZIL" },
  { id: "neo", symbol: "NEO" },
  { id: "sushiswap", symbol: "SUSHI" },
  { id: "maker", symbol: "MKR" },
  { id: "dash", symbol: "DASH" },
  { id: "elrond", symbol: "EGLD" },
];

const Overlay = () => (
  <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center rounded-md z-10">
    <Link href="/sign-in" className="text-white hover:text-zinc-300">
      <Lock className="h-10 w-10" />
    </Link>
  </div>
);

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token =
        typeof window !== "undefined" &&
        (localStorage.getItem("next-auth.session-token") ||
          localStorage.getItem("__Secure-next-auth.session-token"));

      if (token) {
        setIsAuth(true);
        return;
      }

      try {
        const res = await axios.get("/api/auth/verify");
        setIsAuth(!!res.data?.user);
      } catch {
        setIsAuth(false);
      }
    };

    checkAuth();
  }, []);

  return isAuth;
};

// ✅ TradingInput component
const TradingInput = () => {
  const isAuth = useAuth();
  const [fromCoin, setFromCoin] = useState("bitcoin");
  const [toCoin, setToCoin] = useState("ethereum");
  const [amount, setAmount] = useState(0);
  const [refresh, setRefresh] = useState(false);

  const handleTrade = async () => {
    if (amount <= 0 || fromCoin === toCoin) {
      toast.error("Invalid trade input");
      return;
    }

    try {
      const res = await axios.post("/api/trade", {
        fromCoin,
        toCoin,
        amount,
      });

      if (res.data.success) {
        toast.success(
          `Traded ${amount} ${fromCoin.toUpperCase()} for ~${res.data.traded.toAmount.toFixed(
            6
          )} ${toCoin.toUpperCase()}`
        );
        setAmount(0);
        setRefresh((r) => !r); // signal refresh to PortfolioBalance
      } else {
        toast.error(res.data.error || "Trade failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Error executing trade");
    }
  };

  if (isAuth === null) return null;

  return (
    <div className="relative">
      {!isAuth && <Overlay />}
      <div
        className={cn(
          "w-full bg-zinc-900 p-4 mt-4 rounded-md text-white transition-all",
          !isAuth && "blur-sm pointer-events-none select-none"
        )}
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" /> Trade
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <select
              className="bg-zinc-800 text-white px-2 py-1 rounded-md"
              value={fromCoin}
              onChange={(e) => setFromCoin(e.target.value)}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="flex-1 bg-zinc-800 px-2 py-1 rounded-md"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              className="bg-zinc-800 text-white px-2 py-1 rounded-md"
              value={toCoin}
              onChange={(e) => setToCoin(e.target.value)}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <div className="flex-1 bg-zinc-800 px-2 py-1 rounded-md text-right">
              ≈ {(amount * 0.94).toFixed(6)} {toCoin.toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleTrade}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500 transition"
          >
            Execute Trade
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ PortfolioBalance component
const PortfolioBalance = () => {
  const isAuth = useAuth();
  const { favorites } = useFavoriteCoinsStore();
  const [balances, setBalances] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuth) return;

    const fetchBalances = async () => {
      try {
        const res = await axios.get("/api/balance/value");
        setBalances(res.data.breakdown);
      } catch (err) {
        console.error("Failed to load balances");
      }
    };

    fetchBalances();
  }, [isAuth]);

  if (isAuth === null) return null;

  return (
    <div className="relative">
      {!isAuth && <Overlay />}
      <div
        className={cn(
          "w-full bg-zinc-900 p-4 mt-4 rounded-md text-white transition-all",
          !isAuth && "blur-sm pointer-events-none select-none"
        )}
      >
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Coins className="w-5 h-7" /> Portfolio Balances
        </h2>
        <ul className="space-y-2">
          {balances.map((coin) => (
            <li
              key={coin.id}
              className="flex justify-between items-center border-b p-3 border-zinc-800 pb-1"
            >
              <span className="text-white font-medium">{coin.symbol}</span>
              <span className="text-green-400">
                {coin.amount} {coin.symbol}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export { TradingInput, PortfolioBalance };
