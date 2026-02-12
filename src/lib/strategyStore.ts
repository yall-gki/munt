import { create } from "zustand";

export type StrategyItem = {
  id: string;
  name: string;
  type: string;
  coinId?: string | null;
  coinIds?: string[] | null;
  timeframe?: string | null;
  isActive?: boolean;
  parameters?: Record<string, any> | null;
};

interface StrategyStore {
  strategies: StrategyItem[];
  selectedStrategyId: string | null;
  setStrategies: (strategies: StrategyItem[]) => void;
  selectStrategy: (strategyId: string | null) => void;
}

export const useStrategyStore = create<StrategyStore>((set) => ({
  strategies: [],
  selectedStrategyId: null,
  setStrategies: (strategies) =>
    set((state) => ({
      strategies,
      selectedStrategyId: state.selectedStrategyId,
    })),
  selectStrategy: (strategyId) => set({ selectedStrategyId: strategyId }),
}));
