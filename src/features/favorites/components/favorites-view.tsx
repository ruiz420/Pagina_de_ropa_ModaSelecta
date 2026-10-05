"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { useFavoritesStore } from "@/features/favorites/store/favorites-store";

export function FavoritesView({ products }: { products: CatalogProduct[] }) {
  const hydrated = useHydrated();
  const ids = useFavoritesStore((state) => state.ids);

  if (!hydrated) {
    return <div className="min-h-[40vh]" aria-hidden />;
  }

  const favorites = ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is CatalogProduct => Boolean(product));

  if (!favorites.length) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border bg-card p-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
          <Heart className="h-6 w-6" />
        </span>
        <p className="font-display mt-4 text-2xl font-medium">
          Aun no tienes favoritos
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Toca el corazon en lo que te guste y lo encontraras aqui, en este
          mismo celular o computador.
        </p>
        <Button asChild variant="cta" className="mt-6">
          <Link href="/catalogo">Explorar coleccion</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {favorites.length} {favorites.length === 1 ? "producto guardado" : "productos guardados"}
      </p>
      <ProductGrid products={favorites} />
    </>
  );
}
