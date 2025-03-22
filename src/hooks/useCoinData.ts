// hooks/useCoinsData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchCoins } from "../lib/fetchCoins";

export function useCoinsData(ids: any) {
  return useQuery(["coinsData"], () => fetchCoins(ids));
}
