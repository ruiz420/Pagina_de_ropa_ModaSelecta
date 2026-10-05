"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FavoritesState = {
  ids: string[];
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
};

/** Favoritos guardados en el navegador: no requieren cuenta. */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        })),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
    }),
    {
      name: "moda-selecta-favorites",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
