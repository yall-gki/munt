import { useEffect, useState } from "react";

interface Trade {
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
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
      setTrades((prevTrades) => [trade, ...prevTrades.slice(0, 20)]);
      setPrevPrice(parseFloat(trade.p));
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="h-full flex overflow-scroll w-1/4 max-md:h-40 p-2 pl-0 flex-col items-center justify-start text-white ">
      <div className="wrapper h-full w-full bg-zinc-900 rounded-md">
        <ul className="w-full overflow-scroll h-full p-0 max-md:h-40">
          <li
            className={`text-sm text-zinc-500 h-8 px-4 border-b items-center border-b-zinc-700 flex justify-between w-full 
              font-bold transition-all duration-300`}
          >
            <span className="w-1/3">Price</span>
            <span className=" w-1/3">Amount</span>
            <span className=" w-1/3 flex items-center justify-end">
              Time
            </span>
          </li>
          {trades.map((trade, index) => {
            const price = parseFloat(trade.p);
            let textColor = "text-white"; // Default text color

            if (prevPrice !== null) {
              if (price > prevPrice) {
                textColor = "text-green-500"; // Green text for price increase
              } else if (price < prevPrice) {
                textColor = "text-red-500"; // Red text for price decrease
              }
            }

            return (
              <li
                key={index}
                className={`text-xs h-8 px-4 border-b items-center border-b-zinc-700 flex justify-between w-full 
                font-bold transition-all duration-300`}
              >
                <span className={`${textColor} w-1/3 flex items-center`}>
                  {trade.p}
                </span>
                <span className="text-white w-1/3 flex items-center">
                  {trade.q}
                </span>
                <span className="text-white w-1/3 flex items-center justify-end">
                  {new Date(trade.T).toLocaleTimeString()}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default TradeHistory;
