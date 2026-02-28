import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProduct, IFavoriteItem } from "@/types";
import axiosInstance from "@/lib/axios";

interface FavoritesState {
  items: IFavoriteItem[];
  toggleFavorite: (product: IProduct, token?: string) => Promise<void>;
  removeFavorite: (productId: string, token?: string) => Promise<void>;
  clearFavorites: (token?: string) => Promise<void>;
  loadFavoritesFromServer: (token?: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  totalFavorites: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      toggleFavorite: async (product, token) => {
        const exists = get().items.some((i) => i.productId === product._id);
        const nextItems = exists
          ? get().items.filter((i) => i.productId !== product._id)
          : [
              ...get().items,
              {
                productId: product._id,
                name: product.name,
                image: product.image,
                price: product.price,
                countInStock: product.countInStock,
              },
            ];

        set({ items: nextItems });

        if (token) {
          try {
            const { data } = await axiosInstance.post("/api/favorites/toggle", {
              productId: product._id,
            });
            if (Array.isArray(data?.items)) {
              set({ items: data.items });
            }
          } catch (err) {
            console.error("Failed to sync favorites:", err);
          }
        }
      },

      removeFavorite: async (productId, token) => {
        const nextItems = get().items.filter((i) => i.productId !== productId);
        set({ items: nextItems });

        if (token) {
          try {
            const { data } = await axiosInstance.post("/api/favorites/toggle", {
              productId,
            });
            if (Array.isArray(data?.items)) {
              set({ items: data.items });
            }
          } catch (err) {
            console.error("Failed to sync favorites:", err);
          }
        }
      },

      clearFavorites: async (token) => {
        set({ items: [] });

        if (token) {
          try {
            await axiosInstance.delete("/api/favorites");
          } catch (err) {
            console.error("Failed to clear favorites:", err);
          }
        }
      },

      loadFavoritesFromServer: async (token) => {
        if (!token) return;
        try {
          const { data } = await axiosInstance.get<IFavoriteItem[]>(
            "/api/favorites",
          );
          set({ items: data });
        } catch (err) {
          console.error("Failed to load favorites:", err);
        }
      },

      isFavorite: (productId) =>
        get().items.some((item) => item.productId === productId),

      totalFavorites: () => get().items.length,
    }),
    { name: "favorites" },
  ),
);
