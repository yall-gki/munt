import { create } from "zustand";

interface FavoriteCoinsStore {
  favorites: string[];
  line: boolean;
  candle: boolean;
  trades: boolean;
  setFavorites: (ids: string[]) => void;
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (coinId: string) => Promise<void>;
  toggleState: (
    key: keyof Pick<FavoriteCoinsStore, "line" | "candle" | "trades">
  ) => void;
}

// Optional: define expected API response shape
interface FavoriteCoin {
  coinId: string;
}

export const useFavoriteCoinsStore = create<FavoriteCoinsStore>((set, get) => ({
  favorites: [],
  line: true,
  candle: true,
  trades: true,
  setFavorites: (ids) => set({ favorites: ids }),

  fetchFavorites: async () => {
    try {
      const res = await fetch("/api/user-coin");
      const json: FavoriteCoin[] = await res.json();

      if (Array.isArray(json)) {
        const ids = json.map((item) => item.coinId);
        set({ favorites: ids });
      } else {
        console.warn("⚠️ Unexpected favorite response:", json);
        set({ favorites: [] });
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      set({ favorites: [] });
    }
  },

  toggleFavorite: async (coinId: string) => {
    const { favorites, fetchFavorites } = get();
    const isAlreadyFavorite = favorites.includes(coinId);

    try {
      const res = await fetch("/api/user-coin", {
        method: isAlreadyFavorite ? "DELETE" : "POST",
        body: JSON.stringify({ coinId }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      // ✅ Refresh favorites after update
      await fetchFavorites();
    } catch (error) {
      console.error(
        `❌ Failed to ${isAlreadyFavorite ? "remove" : "add"} favorite:`,
        error
      );
    }
  },

  toggleState: (key) => {
    set((state) => ({ [key]: !state[key] }));
  },
}));
