"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { useHydrated } from "@/lib/use-hydrated";
import { useFavoritesStore } from "@/features/favorites/store/favorites-store";

export function FavoriteButton({
  productId,
  productName,
  className,
}: {
  productId: string;
  productName: string;
  className?: string;
}) {
  const hydrated = useHydrated();
  const isFavorite = useFavoritesStore((state) => state.ids.includes(productId));
  const toggle = useFavoritesStore((state) => state.toggle);
  const active = hydrated && isFavorite;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? `Quitar ${productName} de favoritos`
          : `Guardar ${productName} en favoritos`
      }
      onClick={() => {
        toggle(productId);
        track("toggle_favorite", { product: productName, saved: !active });
        toast(active ? "Quitado de favoritos" : "Guardado en favoritos", {
          duration: 1800,
        });
      }}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-90",
        className,
      )}
    >
      <Heart
        // La key reinicia la animacion cada vez que cambia el estado.
        key={String(active)}
        className={cn(
          "h-[18px] w-[18px]",
          active && "animate-in zoom-in-50 fill-brand text-brand duration-200",
        )}
      />
    </button>
  );
}
