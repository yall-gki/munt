// TradeHistory.tsx
import { useEffect, useState } from "react";

interface Trade {
  p: string;
  q: string;
  T: number;
}

const TradeHistory: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol}usdt@trade`
    );
    ws.onmessage = (event) => {
      const trade: Trade = JSON.parse(event.data);
      setTrades((prev) => [trade, ...prev.slice(0, 20)]);
      setPrevPrice(parseFloat(trade.p));
    };
    return () => ws.close();
  }, [symbol]);

  return (
    <div className="h-full max-h-[300px] overflow-y-auto w-full p-2 bg-zinc-900 rounded-md text-white">
      <ul className="w-full">
        <li className="text-sm text-zinc-500 h-8 px-4 border-b border-b-zinc-700 flex justify-between font-bold">
          <span className="w-1/3">Price</span>
          <span className="w-1/3">Amount</span>
          <span className="w-1/3 text-right">Time</span>
        </li>
        {trades.map((trade, index) => {
          const price = parseFloat(trade.p);
          let textColor = "text-white";
          if (prevPrice !== null) {
            if (price > prevPrice) textColor = "text-green-500";
            else if (price < prevPrice) textColor = "text-red-500";
          }
          return (
            <li
              key={index}
              className="text-xs h-8 px-4 border-b border-b-zinc-700 flex justify-between font-bold"
            >
              <span className={`${textColor} w-1/3`}>{trade.p}</span>
              <span className="w-1/3">{trade.q}</span>
              <span className="w-1/3 text-right">
                {new Date(trade.T).toLocaleTimeString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TradeHistory;
