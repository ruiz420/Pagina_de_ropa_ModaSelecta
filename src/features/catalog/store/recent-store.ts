"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const MAX_RECENT = 10;

type RecentState = {
  ids: string[];
  push: (productId: string) => void;
  clear: () => void;
};

/** Ultimos productos vistos (mas reciente primero), guardados en el navegador. */
export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (productId) =>
        set((state) => ({
          ids: [productId, ...state.ids.filter((id) => id !== productId)].slice(
            0,
            MAX_RECENT,
          ),
        })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "nuve-bella-recent",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
