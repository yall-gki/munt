import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCoinsData(ids: string[]) {
  return useQuery({
    queryKey: ["coinsData", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) throw new Error("No IDs");

      const res = await axios.get("https://munt-api.onrender.com/all-prices", {
        timeout: 10000,
      });

      if (res.status !== 200 || !res.data) {
        throw new Error("Failed to fetch coins data from backend");
      }

      // Filter only requested IDs
      const filtered = ids.map((id) => ({
        id,
        current_price: res.data[id] ?? 0,
      }));

      return filtered;
    },
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
