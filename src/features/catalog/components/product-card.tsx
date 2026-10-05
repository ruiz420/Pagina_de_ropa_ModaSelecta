"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import { ProductPrice } from "@/features/catalog/components/product-price";
import { QuickAddSheet } from "@/features/catalog/components/quick-add-sheet";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import {
  getAvailability,
  getProductBadges,
  getSoldLabel,
  hasChoices,
} from "@/features/catalog/lib/product-signals";
import { FavoriteButton } from "@/features/favorites/components/favorite-button";

/**
 * Tarjeta pensada para vender: la foto manda, el precio se entiende de un
 * vistazo y comprar esta a un toque (compra rapida con talla y color).
 */
export function ProductCard({
  product,
  compact = false,
}: {
  product: CatalogProduct;
  compact?: boolean;
}) {
  const addToCart = useAddToCart();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const badges = getProductBadges(product);
  const availability = getAvailability(product);
  const soldLabel = getSoldLabel(product);
  const isOut = availability.status === "out";
  const secondImage = product.images.find((image) => image !== product.image);
  const href = `/producto/${product.slug}`;

  function handleQuickAdd() {
    if (hasChoices(product)) {
      track("open_quick_add", { product: product.name });
      setIsQuickAddOpen(true);
      return;
    }

    addToCart(product, { color: product.colors[0], size: product.sizes[0] });
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        <Link href={href} className="absolute inset-0" aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={
              compact
                ? "(min-width: 640px) 240px, 46vw"
                : "(min-width: 1024px) 25vw, 50vw"
            }
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]",
              isOut && "opacity-60",
            )}
          />
          {secondImage ? (
            <Image
              src={secondImage}
              alt=""
              fill
              sizes={
                compact
                  ? "(min-width: 640px) 240px, 46vw"
                  : "(min-width: 1024px) 25vw, 50vw"
              }
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}
        </Link>

        {badges.length ? (
          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {badges.map((badge) => (
              <Badge
                key={badge.label}
                variant={badge.tone}
                className="px-2.5 py-1 text-xs font-semibold"
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        ) : null}

        <FavoriteButton
          productId={product.id}
          productName={product.name}
          className="absolute right-2.5 top-2.5"
        />

        {!isOut ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Comprar ${product.name}`}
            title="Compra rapida"
            className="absolute bottom-2.5 right-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-soft transition-all duration-300 hover:bg-brand hover:text-brand-foreground active:scale-90 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
          >
            <Plus className="h-5 w-5" />
          </button>
        ) : null}
      </div>

      <div className={cn("mt-3 space-y-1", compact && "mt-2.5")}>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {product.category}
        </p>
        <Link
          href={href}
          className={cn(
            "block font-medium leading-snug hover:underline hover:underline-offset-2",
            compact ? "line-clamp-1 text-sm" : "line-clamp-2 text-[15px]",
          )}
        >
          {product.name}
        </Link>
        <ProductPrice product={product} size={compact ? "sm" : "md"} />
        {availability.status === "low" || soldLabel ? (
          <p className="text-xs text-muted-foreground">
            {availability.status === "low" ? (
              <span className="font-medium text-discount">
                {availability.label}
              </span>
            ) : null}
            {availability.status === "low" && soldLabel ? " · " : null}
            {soldLabel}
          </p>
        ) : null}
      </div>

      <QuickAddSheet
        product={product}
        open={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </article>
  );
}
