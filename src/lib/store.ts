// lib/store.ts (or any client-safe file)
import { create } from "zustand";

interface FavoriteCoinsStore {
  favorites: string[];
  line: boolean;
  candle: boolean;
  trades: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (coinId: string) => Promise<void>;
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

  addFavorite: async (coinId: string) => {
    set((state) => ({
      favorites: state.favorites.includes(coinId)
        ? state.favorites.filter((id) => id !== coinId)
        : [...state.favorites, coinId],
    }));

    try {
      await fetch("/api/coins/add-fav", {
        method: "POST",
        body: JSON.stringify({ coinId }),
        headers: { "Content-Type": "application/json" },
      });

      await useFavoriteCoinsStore.getState().fetchFavorites();
    } catch (error) {
      console.error("❌ Failed to add favorite:", error);
    }
  },

  toggleState: (key) => set((state) => ({ [key]: !state[key] })),
}));
