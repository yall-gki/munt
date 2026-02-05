"use client";

import { useQuery } from "@tanstack/react-query";
import type { CandlestickData, LineData, UTCTimestamp } from "lightweight-charts";

type BinanceKlinesResult = {
  candles: CandlestickData<UTCTimestamp>[];
  line: LineData<UTCTimestamp>[];
};

type BinanceKline = [number, string, string, string, string, ...any[]];

async function fetchBinanceKlines(
  symbol: string,
  interval: string
): Promise<BinanceKlinesResult> {
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}USDT&interval=${interval}&limit=500`
  );
  const rawData = (await response.json()) as BinanceKline[];

  if (!Array.isArray(rawData)) {
    throw new Error("Binance data unavailable");
  }

  const candles: CandlestickData<UTCTimestamp>[] = rawData.map((item) => ({
    time: (item[0] / 1000) as UTCTimestamp, // <-- type-safe cast
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
  }));

  const line: LineData<UTCTimestamp>[] = candles.map((item) => ({
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
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
