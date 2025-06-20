import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useChartData(coinId: string | null) {
  return useQuery({
    queryKey: ["chartData", coinId],
    queryFn: async () => {
      if (!coinId) throw new Error("No coin ID provided");
      const res = await axios.get(`/api/coins/chartdata?id=${coinId}`);
      return res.data;
    },
    enabled: !!coinId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
