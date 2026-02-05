import { useQuery } from "@tanstack/react-query";
import type { CandlestickData, LineData } from "lightweight-charts";

type BinanceKlinesResult = {
  candles: CandlestickData[];
  line: LineData[];
};

async function fetchBinanceKlines(
  symbol: string,
  interval: string
): Promise<BinanceKlinesResult> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=500`
  );
  const rawData = await response.json();

  if (!Array.isArray(rawData)) {
    throw new Error("Binance data unavailable");
  }

  const candles: CandlestickData[] = rawData.map((item: any) => ({
    time: item[0] / 1000,
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
  }));

  const line: LineData[] = candles.map((item) => ({
    time: item.time,
    value: item.close,
  }));

  return { candles, line };
}

export function useBinanceKlines(symbol: string, interval: string) {
  return useQuery({
    queryKey: ["binanceKlines", symbol, interval],
    queryFn: () => fetchBinanceKlines(symbol, interval),
    enabled: !!symbol && !!interval,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
}
