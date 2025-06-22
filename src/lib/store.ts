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
      if (Array.isArray(json) && json.length > 0) {
        set({ favorites: json.map((item: any) => item.coinId) });
      } else {
        set({ favorites: [] });
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      set({ favorites: [] });
    }
  },

  toggleFavorite: async (coinId: string) => {
    const isAlreadyFavorite = useFavoriteCoinsStore
      .getState()
      .favorites.includes(coinId);
  
    try {
      await fetch("/api/user-coin", {
        method: isAlreadyFavorite ? "DELETE" : "POST",
        body: JSON.stringify({ coinId }),
        headers: { "Content-Type": "application/json" },
      });
  
      // ✅ Re-fetch server state after toggling
      await useFavoriteCoinsStore.getState().fetchFavorites();
    } catch (error) {
      console.error("❌ Failed to update favorite:", error);
    }
  },
  

  toggleState: (key) => set((state) => ({ [key]: !state[key] })),
}));
