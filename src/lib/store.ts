import { create } from "zustand";

interface FavoriteCoinsStore {
  favorites: string[];
  fetchFavorites: () => Promise<void>;
  addFavorite: (coinId: string) => Promise<void>;
}

export const useFavoriteCoinsStore = create<FavoriteCoinsStore>((set) => ({
  favorites: [],

  fetchFavorites: async () => {
    try {
      const response = await fetch("/api/user-coin");
      const data = await response.json();
      set({ favorites: Array.isArray(data) ? data.map((c) => c.coinId) : [] });
    } catch (error) {
      console.error("Error fetching favorite coins:", error);
      set({ favorites: [] });
    }
  },

  addFavorite: async (coinId) => {
    set((state) => ({
      favorites: state.favorites.includes(coinId)
        ? state.favorites.filter((id) => id !== coinId) // Remove if exists
        : [...state.favorites, coinId], // Add if not exists
    }));

    try {
      await fetch("/api/coins/add-fav", {
        method: "POST",
        body: JSON.stringify({ coinId }),
        headers: { "Content-Type": "application/json" },
      });

      // Refresh to ensure correct data after API update
      await useFavoriteCoinsStore.getState().fetchFavorites();
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  },
}));
