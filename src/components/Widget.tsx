"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Coins, ArrowLeftRight, Loader2, Repeat } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const coins = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "cardano", symbol: "ADA" },
  { id: "ripple", symbol: "XRP" },
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
  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
    <Link href="/sign-in" className="text-white hover:text-zinc-300">
      <Lock className="h-8 w-8" />
    </Link>
  </div>
);

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  useEffect(() => {
    const token =
      typeof window !== "undefined" &&
      (localStorage.getItem("next-auth.session-token") ||
        localStorage.getItem("__Secure-next-auth.session-token"));
    if (token) return setIsAuth(true);
    axios
      .get("/api/auth/verify")
      .then((res) => setIsAuth(!!res.data?.user))
      .catch(() => setIsAuth(false));
  }, []);
  return isAuth;
};

export const TradingInput = () => {
  const isAuth = useAuth();
  const [fromCoin, setFromCoin] = useState("bitcoin");
  const [toCoin, setToCoin] = useState("ethereum");
  const [amount, setAmount] = useState(1);
  const [isTrading, setIsTrading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [priceRes, balanceRes] = await Promise.all([
        axios.get("https://munt-api-production.up.railway.app/all-prices"),
        axios.get("/api/balance/value"),
      ]);
      setPrices(priceRes.data);

      const sorted = balanceRes.data.breakdown.sort((a: any, b: any) => {
        const priceA = priceRes.data[a.id.toLowerCase()] || 0;
        const priceB = priceRes.data[b.id.toLowerCase()] || 0;
        return b.amount * priceB - a.amount * priceA;
      });

      setBalances(sorted);
    } catch {
      toast.error("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) refreshData();
  }, [isAuth]);

  const getEstimate = () => {
    const fromPrice = prices[fromCoin];
    const toPrice = prices[toCoin];
    if (!fromPrice || !toPrice || fromCoin === toCoin) return "0.000000";
    return ((amount * fromPrice) / toPrice).toFixed(6);
  };

  const handleTrade = async () => {
    if (amount <= 0 || fromCoin === toCoin) {
      toast.error("Invalid trade input");
      return;
    }
    setIsTrading(true);
    try {
      const res = await axios.post("/api/trade", { fromCoin, toCoin, amount });
      if (res.data.success) {
        toast.success(`Traded ${amount} ${fromCoin.toUpperCase()}!`);
        setAmount(0);
        await refreshData();
      } else {
        toast.error(res.data.error || "Trade failed");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Trade error");
    } finally {
      setIsTrading(false);
    }
  };

  if (isAuth === null)
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );

  return (
    <div className="relative">
      {!isAuth && <Overlay />}
      <div
        className={cn(
          "bg-zinc-900 p-4 mt-4 rounded-xl shadow text-white",
          !isAuth && "blur-sm pointer-events-none"
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" /> Trade
          </h2>
          <button onClick={refreshData}>
            <Repeat className="w-5 h-5 text-zinc-400 hover:text-white" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <select
              className="bg-zinc-800 px-3 py-2 rounded-md flex-1"
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
              className="bg-zinc-800 px-3 py-2 rounded-md flex-1"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="bg-zinc-800 px-3 py-2 rounded-md flex-1"
              value={toCoin}
              onChange={(e) => setToCoin(e.target.value)}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.symbol}
                </option>
              ))}
            </select>
            <div className="bg-zinc-800 px-3 py-2 rounded-md text-sm text-right flex-1">
              ≈ {getEstimate()} {toCoin.toUpperCase()}
            </div>
          </div>
          <button
            onClick={handleTrade}
            disabled={isTrading}
            className="mt-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded-md flex items-center justify-center gap-2"
          >
            {isTrading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isTrading ? "Trading..." : "Execute Trade"}
          </button>
        </div>
      </div>

      {/* Portfolio */}
      <div className="mt-6 bg-zinc-900 p-4 rounded-xl shadow text-white h-64 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5" /> Portfolio
        </h2>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
          </div>
        ) : (
          <ul className="space-y-2">
            {balances.map((coin) => (
              <li
                key={coin.id}
                className="flex justify-between items-center border-b border-zinc-800 pb-2 text-sm"
              >
                <span className="font-semibold bg-zinc-800 px-3 py-1 rounded-full">
                  {coin.symbol}
                </span>
                <span className="text-green-400 font-mono">
                  {parseFloat(coin.amount).toFixed(6)} | $
                  {(coin.amount * (prices[coin.id.toLowerCase()] || 0)).toFixed(
                    2
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
