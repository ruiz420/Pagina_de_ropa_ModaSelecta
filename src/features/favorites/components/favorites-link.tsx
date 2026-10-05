"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { useFavoritesStore } from "@/features/favorites/store/favorites-store";

export function FavoritesLink() {
  const hydrated = useHydrated();
  const count = useFavoritesStore((state) => state.ids.length);

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative hidden sm:inline-flex"
    >
      <Link
        href="/favoritos"
        aria-label={
          hydrated && count ? `Favoritos (${count})` : "Favoritos"
        }
      >
        <Heart className="h-5 w-5" />
        {hydrated && count ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
            {count}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
