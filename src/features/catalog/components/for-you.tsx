"use client";

import { useMemo } from "react";
import { Container } from "@/components/ui/container";
import { useHydrated } from "@/lib/use-hydrated";
import { ProductRail } from "@/features/catalog/components/product-rail";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { getAvailability, getDiscountPercent } from "@/features/catalog/lib/product-signals";
import { usePersonalizationStore } from "@/features/catalog/store/personalization-store";
import { useRecentStore } from "@/features/catalog/store/recent-store";
import { useFavoritesStore } from "@/features/favorites/store/favorites-store";

const MAX_CATEGORIES = 2;
const MAX_PRODUCTS = 8;
const FAVORITE_WEIGHT = 2;

function joinNames(names: string[]) {
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`
    : (names[0] ?? "");
}

/**
 * "Elegidos para ti": recomienda productos de las categorias que la persona
 * vio o guardo (los favoritos pesan el doble), sin repetir lo que ya conoce.
 * Siempre explica por que, y se puede borrar el historial o desactivar.
 * Se basa solo en comportamiento real de este dispositivo, no en edad ni genero.
 */
export function ForYou({ products }: { products: CatalogProduct[] }) {
  const hydrated = useHydrated();
  const enabled = usePersonalizationStore((state) => state.enabled);
  const setEnabled = usePersonalizationStore((state) => state.setEnabled);
  const recentIds = useRecentStore((state) => state.ids);
  const favoriteIds = useFavoritesStore((state) => state.ids);

  const recommendation = useMemo(() => {
    const seen = new Set([...recentIds, ...favoriteIds]);
    const scores = new Map<string, number>();

    for (const id of recentIds) {
      const category = products.find((product) => product.id === id)?.category;

      if (category) {
        scores.set(category, (scores.get(category) ?? 0) + 1);
      }
    }

    for (const id of favoriteIds) {
      const category = products.find((product) => product.id === id)?.category;

      if (category) {
        scores.set(category, (scores.get(category) ?? 0) + FAVORITE_WEIGHT);
      }
    }

    const topCategories = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_CATEGORIES)
      .map(([category]) => category);

    const picks = products
      .filter(
        (product) =>
          topCategories.includes(product.category) &&
          !seen.has(product.id) &&
          getAvailability(product).status !== "out",
      )
      .sort(
        (a, b) =>
          (scores.get(b.category) ?? 0) - (scores.get(a.category) ?? 0) ||
          (getDiscountPercent(b) ?? 0) - (getDiscountPercent(a) ?? 0),
      )
      .slice(0, MAX_PRODUCTS);

    return { picks, categories: topCategories, hasSignals: scores.size > 0 };
  }, [products, recentIds, favoriteIds]);

  if (!hydrated) {
    return null;
  }

  if (!enabled && recommendation.hasSignals) {
    return (
      <Container className="py-4">
        <p className="text-xs text-muted-foreground">
          Recomendaciones personalizadas desactivadas.{" "}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground"
            onClick={() => setEnabled(true)}
          >
            Activar
          </button>
        </p>
      </Container>
    );
  }

  if (!enabled || !recommendation.picks.length) {
    return null;
  }

  return (
    <ProductRail
      tone="soft"
      eyebrow="Para ti"
      title="Elegidos para ti"
      description={`Porque viste o guardaste ${joinNames(recommendation.categories)}.`}
      products={recommendation.picks}
    />
  );
}
