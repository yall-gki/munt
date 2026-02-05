import axios from "axios";
import { getRedis } from "./redis";

export type ChartPoint = {
  time: number; // unix seconds
  open?: number;
  high?: number;
  low?: number;
  close: number;
};

type FetchChartOptions = {
  symbol?: string;
  interval?: string;
  days?: number;
  bypassCache?: boolean;
};

const intervalToMinutes: Record<string, number> = {
  "1m": 1,
  "3m": 3,
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "2h": 120,
  "4h": 240,
  "6h": 360,
  "12h": 720,
  "1d": 1440,
};

export async function fetchCharts(
  coinId: string,
  options: FetchChartOptions = {}
): Promise<ChartPoint[]> {
  const redis = (() => {
    try {
      return getRedis();
    } catch {
      return null;
    }
  })();
  const normalizedCoin = coinId.toLowerCase();
  const symbol = options.symbol?.toUpperCase();
  const interval = options.interval ?? "1h";
  const days = options.days ?? 7;
  const cacheKey = `chart:${normalizedCoin}:${symbol ?? "NA"}:${interval}:${days}`;

  // 1️⃣ Redis cache
  if (!options.bypassCache && redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached && typeof cached === "string") return JSON.parse(cached);
    } catch {
      // ignore cache errors
    }
  }

  // 2️⃣ Try Binance first (best for candlesticks)
  try {
    if (!symbol) {
      throw new Error("Missing symbol for Binance fetch");
    }
    const binanceSymbol = `${symbol}USDT`;
    const intervalMinutes = intervalToMinutes[interval] ?? 60;
    const estimatedLimit = Math.ceil((days * 24 * 60) / intervalMinutes);
    const limit = Math.min(1000, Math.max(50, estimatedLimit));

    const res = await axios.get(
      "https://api.binance.com/api/v3/klines",
      {
        params: {
          symbol: binanceSymbol,
          interval,
          limit,
        },
        timeout: 8000,
      }
    );

    const candles: ChartPoint[] = res.data.map((c: any[]) => ({
      time: Math.floor(c[0] / 1000),
      open: Number(c[1]),
      high: Number(c[2]),
      low: Number(c[3]),
      close: Number(c[4]),
    }));

    if (!options.bypassCache && redis) {
      await redis.set(cacheKey, JSON.stringify(candles), { ex: 300 });
    }
    return candles;
  } catch (binanceError) {
    console.warn("Binance failed, falling back to CoinGecko");
  }

  // 3️⃣ Fallback → CoinGecko (line chart)
  try {
    const res = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${normalizedCoin}/market_chart`,
      {
        params: { vs_currency: "usd", days },
        timeout: 10000,
      }
    );

    const prices = res.data?.prices ?? [];

    const line: ChartPoint[] = prices.map((p: any[]) => ({
      time: Math.floor(p[0] / 1000),
      close: Number(p[1]),
    }));

    if (!options.bypassCache && redis) {
      await redis.set(cacheKey, JSON.stringify(line), { ex: 300 });
    }
    return line;
  } catch (geckoError) {
    console.error("CoinGecko failed", geckoError);
    throw new Error("Failed to fetch chart data from Binance and CoinGecko");
  }
}
