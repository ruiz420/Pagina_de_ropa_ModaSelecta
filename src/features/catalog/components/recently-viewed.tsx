"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { useHydrated } from "@/lib/use-hydrated";
import { ProductRail } from "@/features/catalog/components/product-rail";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { usePersonalizationStore } from "@/features/catalog/store/personalization-store";
import { useRecentStore } from "@/features/catalog/store/recent-store";

/** Registra la visita de un producto (se monta una vez en la ficha). */
export function ViewTracker({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const push = useRecentStore((state) => state.push);
  const enabled = usePersonalizationStore((state) => state.enabled);

  useEffect(() => {
    track("view_product", { product: productName });

    if (enabled) {
      push(productId);
    }
  }, [productId, productName, push, enabled]);

  return null;
}

/** "Vistos recientemente": se arma con lo que la persona abrio en este navegador. */
export function RecentlyViewed({
  products,
  excludeId,
}: {
  products: CatalogProduct[];
  excludeId?: string;
}) {
  const hydrated = useHydrated();
  const ids = useRecentStore((state) => state.ids);
  const enabled = usePersonalizationStore((state) => state.enabled);

  if (!hydrated || !enabled) {
    return null;
  }

  const recent = ids
    .filter((id) => id !== excludeId)
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is CatalogProduct => Boolean(product))
    .slice(0, 8);

  if (!recent.length) {
    return null;
  }

  return <ProductRail title="Vistos recientemente" products={recent} />;
}
