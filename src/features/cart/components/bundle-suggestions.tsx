"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/config/store";
import { applyBundleDiscount, isBundleOfferEnabled, priceCart } from "@/features/cart/lib/pricing";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import { useCartStore } from "@/features/cart/store/cart-store";
import { QuickAddSheet } from "@/features/catalog/components/quick-add-sheet";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { getAvailability, hasChoices } from "@/features/catalog/lib/product-signals";
import { track } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

const MAX_SUGGESTIONS = 3;

/**
 * Descuento por combinar. Reglas (visibles para la persona):
 *  - se aplica a accesorios y belleza cuando la bolsa tiene una prenda;
 *  - sin prenda, solo se explica la condicion;
 *  - sin temporizadores, sin precios inflados: el precio normal sigue a la vista.
 */
export function BundleSuggestions({
  addOns,
  onNavigate,
}: {
  addOns: CatalogProduct[];
  onNavigate: () => void;
}) {
  const items = useCartStore((state) => state.items);
  const { hasGarment } = priceCart(items);
  const percent = STORE.bundleOffer.percent;
  const inCart = new Set(items.map((item) => item.productId));
  const suggestions = addOns
    .filter(
      (product) =>
        !inCart.has(product.id) && getAvailability(product).status !== "out",
    )
    .slice(0, MAX_SUGGESTIONS);
  const suggestionCount = suggestions.length;
  const visible =
    isBundleOfferEnabled() && items.length > 0 && hasGarment && suggestionCount > 0;

  useEffect(() => {
    if (visible) {
      track("bundle_offer_shown", { suggestions: suggestionCount });
    }
  }, [visible, suggestionCount]);

  if (!isBundleOfferEnabled() || !items.length) {
    return null;
  }

  if (!hasGarment) {
    return (
      <div className="mt-4 rounded-2xl bg-brand-soft p-4 text-sm">
        <p className="font-medium text-brand-strong">
          {percent}% de descuento en accesorios y belleza
        </p>
        <p className="mt-1 text-foreground/75">
          Se aplica cuando llevas una prenda en tu pedido.
        </p>
        <Link
          href="/catalogo"
          onClick={onNavigate}
          className="mt-2 inline-block font-medium text-brand-strong underline underline-offset-4"
        >
          Ver prendas
        </Link>
      </div>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="mt-4 rounded-2xl bg-brand-soft p-4">
      <p className="text-sm font-semibold text-brand-strong">
        Completa tu pedido con {percent}% menos
      </p>
      <p className="mt-0.5 text-xs text-foreground/70">
        Accesorios y belleza tienen {percent}% de descuento porque llevas una
        prenda.
      </p>
      <ul className="mt-3 space-y-2.5">
        {suggestions.map((product) => (
          <SuggestionRow key={product.id} product={product} percent={percent} />
        ))}
      </ul>
    </div>
  );
}

function SuggestionRow({
  product,
  percent,
}: {
  product: CatalogProduct;
  percent: number;
}) {
  const addToCart = useAddToCart();
  const [isChoosing, setIsChoosing] = useState(false);

  function handleAdd() {
    track("bundle_offer_add", { product: product.name });

    if (hasChoices(product)) {
      setIsChoosing(true);
      return;
    }

    addToCart(product, { color: product.colors[0], size: product.sizes[0] });
  }

  return (
    <li className="flex items-center gap-3 rounded-xl bg-card p-2.5">
      <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image src={product.image} alt="" fill sizes="44px" className="object-cover" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{product.name}</span>
        <span className="flex items-baseline gap-2 text-sm tabular-nums">
          <span className="font-semibold text-discount">
            {formatCurrency(applyBundleDiscount(product.price))}
          </span>
          <span className="text-xs text-muted-foreground line-through">
            {formatCurrency(product.price)}
          </span>
        </span>
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0 rounded-full"
        aria-label={`Agregar ${product.name} con ${percent}% de descuento`}
        onClick={handleAdd}
      >
        <Plus className="h-4 w-4" />
        Agregar
      </Button>
      <QuickAddSheet
        product={product}
        open={isChoosing}
        onClose={() => setIsChoosing(false)}
        note={`${percent}% de descuento al llevarlo con tu prenda`}
      />
    </li>
  );
}
