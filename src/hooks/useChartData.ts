import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type ChartQueryOptions = {
  symbol?: string;
  days?: number;
  interval?: string;
  enabled?: boolean;
  refetchInterval?: number;
};

export function useChartData(
  coinId: string | null,
  options: ChartQueryOptions = {}
) {
  return useQuery({
    queryKey: [
      "chartData",
      coinId,
      options.symbol ?? "",
      options.days ?? "",
      options.interval ?? "",
    ],
    queryFn: async () => {
      if (!coinId) throw new Error("No coin ID provided");
      const params = new URLSearchParams({ id: coinId });
      if (options.symbol) params.set("symbol", options.symbol);
      if (options.interval) params.set("interval", options.interval);
      if (Number.isFinite(options.days)) {
        params.set("days", String(options.days));
      }
      const res = await axios.get(`/api/coins/chartdata?${params.toString()}`);
      return res.data;
    },
    enabled: !!coinId && (options.enabled ?? true),
    staleTime: 1000 * 60 * 2,
    refetchInterval: options.refetchInterval ?? 60_000,
    refetchOnWindowFocus: false,
  });
}
