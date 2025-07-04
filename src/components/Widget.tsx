"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useFavoriteCoinsStore } from "@/lib/store";
import { Coins, ArrowLeftRight } from "lucide-react";

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

const TradingInput = () => {
  const [fromCoin, setFromCoin] = useState("bitcoin");
  const [toCoin, setToCoin] = useState("ethereum");
  const [amount, setAmount] = useState(0);

  return (
    <div className="w-full bg-zinc-900 p-4 mt-4 rounded-md text-white">
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
            ≈ {amount * 0.94} {toCoin.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const PortfolioBalance = () => {
  const { favorites } = useFavoriteCoinsStore();
  const mockBalances : any = {
    bitcoin: 0.42,
    ethereum: 1.7,
    binancecoin: 3.2,
    cardano: 230,
    xrp: 520,
  };

  return (
    <div className="w-full bg-zinc-900 p-4 mt-4 rounded-md text-white">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Coins className="w-5 h-7" /> Portfolio Balances
      </h2>
      <ul className="space-y-2">
        {coins.map(
          (coin) =>
            mockBalances[coin.id] && (
              <li
                key={coin.id}
                className="flex justify-between items-center border-b p-3 border-zinc-800 pb-1"
              >
                <span className="text-white font-medium">{coin.symbol}</span>
                <span className="text-green-400">
                  {mockBalances[coin.id]} {coin.symbol}
                </span>
              </li>
            )
        )}
      </ul>
    </div>
  );
};

export { TradingInput, PortfolioBalance };
