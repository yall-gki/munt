// hooks/useChartData.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useChartData(coinId: string | null) {
  return useQuery({
    queryKey: ["chartData", coinId],
    queryFn: async () => {
      if (!coinId) throw new Error("No coin ID provided");
      const res = await axios.get(`/api/chart-data?id=${coinId}`);
      return res.data;
    },
    enabled: !!coinId, // only run if coinId is not null
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
