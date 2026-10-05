"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/features/cart/store/cart-store";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { track } from "@/lib/analytics";

export type CartSelection = {
  color?: string;
  size?: string;
  image?: string;
};

/** Unico punto donde un producto entra a la bolsa (tarjeta, compra rapida y ficha). */
export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  return useCallback(
    (product: CatalogProduct, selection: CartSelection = {}) => {
      addItem({
        productId: product.id,
        name: product.name,
        reference: product.reference,
        slug: product.slug,
        image: selection.image ?? product.image,
        category: product.category,
        price: product.price,
        quantity: 1,
        color: selection.color || undefined,
        size: selection.size || undefined,
      });
      track("add_to_cart", {
        product: product.name,
        category: product.category,
        price: product.price,
      });
      toast.success("Agregado a tu bolsa");
      openCart();
    },
    [addItem, openCart],
  );
}
