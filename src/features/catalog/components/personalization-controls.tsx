"use client";

import { toast } from "sonner";
import { Container } from "@/components/ui/container";
import { track } from "@/lib/analytics";
import { useHydrated } from "@/lib/use-hydrated";
import { useRecentStore } from "@/features/catalog/store/recent-store";
import { usePersonalizationStore } from "@/features/catalog/store/personalization-store";
import { useFavoritesStore } from "@/features/favorites/store/favorites-store";

/**
 * Explica que datos se usan para recomendar y deja corregirlos: borrar el
 * historial o apagar las sugerencias. Solo aparece si hay algo que controlar.
 */
export function PersonalizationControls() {
  const hydrated = useHydrated();
  const enabled = usePersonalizationStore((state) => state.enabled);
  const setEnabled = usePersonalizationStore((state) => state.setEnabled);
  const recentCount = useRecentStore((state) => state.ids.length);
  const clear = useRecentStore((state) => state.clear);
  const favoriteCount = useFavoritesStore((state) => state.ids.length);

  if (!hydrated || !enabled || !(recentCount || favoriteCount)) {
    return null;
  }

  return (
    <Container className="pb-10">
      <p className="text-xs leading-5 text-muted-foreground">
        Las sugerencias de arriba usan solo lo que viste y guardaste en este
        dispositivo.{" "}
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            clear();
            track("clear_personalization", { action: "borrar_historial" });
            toast("Historial borrado");
          }}
        >
          Borrar historial
        </button>
        {" · "}
        <button
          type="button"
          className="underline underline-offset-2 hover:text-foreground"
          onClick={() => {
            setEnabled(false);
            track("clear_personalization", { action: "desactivar" });
            toast("Recomendaciones desactivadas");
          }}
        >
          Desactivar
        </button>
      </p>
    </Container>
  );
}
