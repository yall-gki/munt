import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCoinsData(ids: string[]) {
  return useQuery({
    queryKey: ["coinsData", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) throw new Error("No IDs");

      const res = await axios.get("/api/coin-history", { timeout: 10000 });

      if (res.status !== 200 || !res.data) {
        throw new Error("Failed to fetch coins data from backend");
      }

      const data = Array.isArray(res.data) ? res.data : [];
      return data.filter((coin: any) => ids.includes(coin.id));
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
