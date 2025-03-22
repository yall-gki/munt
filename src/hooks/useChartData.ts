// hooks/useCoinsData.ts

import { useQuery } from "@tanstack/react-query";
import { fetchCharts } from "../lib/fetchCharts";

export function useChartData(coinName: any) {
  return useQuery(["hi", coinName], () => fetchCharts(coinName));
}
