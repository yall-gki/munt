// src/hooks/useCoinsData.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCoinsData(ids: string[]) {
  return useQuery({
    queryKey: ["coinsData", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) throw new Error("No IDs");

      const query = new URLSearchParams({ ids: ids.join(",") }).toString();
      const res = await axios.get(`/api/coins/fetchCoins?${query}`);
      return res.data;
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5,
  });
}
g