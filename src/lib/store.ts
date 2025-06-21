// lib/store.ts
import { create } from "zustand";

interface FavoriteCoinsStore {
  favorites: string[];
  line: boolean;
  candle: boolean;
  trades: boolean;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (coinId: string) => Promise<void>;
  toggleState: (key: "line" | "candle" | "trades") => void;
}

export const useFavoriteCoinsStore = create<FavoriteCoinsStore>((set) => ({
  favorites: [],
  line: true,
  candle: true,
  trades: true,

  fetchFavorites: async () => {
    try {
      const res = await fetch("/api/user-coin");
      const json = await res.json();
      set({ favorites: json.map((item: any) => item.coinId) });
    } catch (err) {
      console.error("❌ Fetch error:", err);
      set({ favorites: [] });
    }
  },

  toggleFavorite: async (coinId: string) => {
    set((state) => ({
      favorites: state.favorites.includes(coinId)
        ? state.favorites.filter((id) => id !== coinId)
        : [...state.favorites, coinId],
    }));

    try {
      const isAlreadyFavorite = useFavoriteCoinsStore
        .getState()
        .favorites.includes(coinId);

      await fetch("/api/user-coin", {
        method: isAlreadyFavorite ? "DELETE" : "POST",
        body: JSON.stringify({ coinId }),
        headers: { "Content-Type": "application/json" },
      });

      await useFavoriteCoinsStore.getState().fetchFavorites();
    } catch (error) {
      console.error("❌ Failed to update favorite:", error);
    }
  },

  toggleState: (key) => set((state) => ({ [key]: !state[key] })),
}));
