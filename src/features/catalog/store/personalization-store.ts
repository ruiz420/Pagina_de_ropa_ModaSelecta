"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PersonalizationState = {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
};

/** La persona decide si la tienda usa su historial para recomendar (control del usuario). */
export const usePersonalizationStore = create<PersonalizationState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: "moda-selecta-personalization",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
