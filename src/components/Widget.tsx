"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Coins, ArrowLeftRight, Loader2, Repeat, ArrowDownUp } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useStrategyStore } from "@/lib/strategyStore";

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
    <Link href="/login" className="text-white hover:text-zinc-300">
      <Lock className="h-8 w-8" />
    </Link>
  </div>
);

// MOBILE-FRIENDLY AUTH HOOK
const useAuth = () => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    axios
      .get("/api/auth/verify", { withCredentials: true }) // important!
      .then((res) => setIsAuth(!!res.data?.user))
      .catch(() => setIsAuth(false));
  }, []);

  return isAuth;
};

type TradingInputProps = {
  onTradeComplete?: () => void;
  contextCoinId?: string;
};

export const TradingInput: React.FC<TradingInputProps> = ({
  onTradeComplete,
  contextCoinId,
}) => {
  const isAuth = useAuth();
  const [fromCoin, setFromCoin] = useState("bitcoin");
  const [toCoin, setToCoin] = useState("ethereum");
  const [amountInput, setAmountInput] = useState("1");
  const [isTrading, setIsTrading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [balances, setBalances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { strategies, selectedStrategyId, selectStrategy } = useStrategyStore();

  const refreshData = async () => {
    setLoading(true);
    try {
      const [priceRes, balanceRes] = await Promise.all([
        axios.get("https://munt-api.onrender.com/all-prices"),
        axios.get("/api/balance/value", { withCredentials: true }),
      ]);

      setPrices(priceRes.data);
      setLastUpdated(new Date());

      const sorted = balanceRes.data.breakdown.sort((a: any, b: any) => {
        const priceA = priceRes.data[a.id.toLowerCase()] || 0;
        const priceB = priceRes.data[b.id.toLowerCase()] || 0;
        return b.amount * priceB - a.amount * priceA;
      });

      setBalances(sorted);
    } catch {
      toast.error("Failed to fetch balances or prices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth !== true) return; // wait explicitly for auth

    refreshData();
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [isAuth]);

  const amountNum = Number(amountInput);
  const fromPrice = prices[fromCoin];
  const toPrice = prices[toCoin];
  const fromBalance = balances.find((b) => b.id === fromCoin);
  const availableAmount = Number(fromBalance?.amount || 0);
  const fromSymbol = coins.find((c) => c.id === fromCoin)?.symbol ?? fromCoin.toUpperCase();
  const toSymbol = coins.find((c) => c.id === toCoin)?.symbol ?? toCoin.toUpperCase();
  const hasPrices = Number.isFinite(fromPrice) && Number.isFinite(toPrice) && fromPrice > 0 && toPrice > 0;
  const isValidAmount = Number.isFinite(amountNum) && amountNum > 0;
  const isSameAsset = fromCoin === toCoin;
  const isInsufficient = isValidAmount && amountNum > availableAmount;
  const estimatedToAmount =
    isValidAmount && hasPrices && !isSameAsset
      ? ((amountNum * fromPrice) / toPrice).toFixed(6)
      : "0.000000";

  const rateLabel = useMemo(() => {
    if (!hasPrices || isSameAsset) return null;
    const rate = fromPrice / toPrice;
    if (!Number.isFinite(rate)) return null;
    return `1 ${fromSymbol} ≈ ${rate.toFixed(6)} ${toSymbol}`;
  }, [fromCoin, toCoin, fromPrice, toPrice, hasPrices, isSameAsset]);

  const canTrade =
    isAuth &&
    !loading &&
    !isTrading &&
    isValidAmount &&
    hasPrices &&
    !isSameAsset &&
    !isInsufficient;

  const handleSwap = () => {
    setFromCoin(toCoin);
    setToCoin(fromCoin);
  };

  const handleTrade = async () => {
    if (!canTrade) {
      if (isSameAsset) toast.error("Choose two different assets.");
      else if (isInsufficient) toast.error("Insufficient balance.");
      else toast.error("Invalid trade input");
      return;
    }

    setIsTrading(true);
    try {
      const res = await axios.post(
        "/api/trade",
        {
          fromCoin,
          toCoin,
          amount: amountNum,
          strategyId: selectedStrategyId || undefined,
          contextCoinId: contextCoinId || undefined,
        },
        { withCredentials: true } // important!
      );

      if (res.data.success) {
        toast.success(
          `Traded ${amountNum} ${fromSymbol} for ${Number(res.data.traded.toAmount).toFixed(6)} ${toSymbol}`
        );
        setAmountInput("0");
        await refreshData();
        onTradeComplete?.();
      } else toast.error(res.data.error || "Trade failed");
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
          "bg-zinc-900 p-4 mt-4 rounded-xl shadow text-white border border-zinc-800",
          !isAuth && "blur-sm pointer-events-none"
        )}
      >
        {/* ... rest of UI unchanged ... */}
      </div>

      <div className="mt-6 bg-zinc-900 p-4 rounded-xl shadow text-white h-64 overflow-y-auto border border-zinc-800">
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
                <span className="text-blue-300 font-mono">
                  {parseFloat(coin.amount).toFixed(6)} | $
                  {(coin.amount * (prices[coin.id.toLowerCase()] || 0)).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
