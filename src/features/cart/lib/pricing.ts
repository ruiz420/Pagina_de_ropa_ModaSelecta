import { STORE } from "@/config/store";
import type { CartItem } from "@/features/cart/store/cart-store";
import { isAddOnCategory } from "@/features/catalog/lib/product-signals";

/** Precio de un complemento (accesorio o belleza) con el descuento por combinar. */
export function applyBundleDiscount(price: number) {
  return Math.round(price * (1 - STORE.bundleOffer.percent / 100));
}

export function isBundleOfferEnabled() {
  return STORE.bundleOffer.enabled && STORE.bundleOffer.percent > 0;
}

export type PricedLine = {
  item: CartItem;
  unitPrice: number;
  originalUnitPrice: number;
  discounted: boolean;
  lineTotal: number;
};

/**
 * Calcula la bolsa con las reglas del descuento por combinar:
 * los complementos tienen el descuento mientras haya al menos una prenda.
 * Si la prenda sale de la bolsa, el descuento desaparece (la regla es visible).
 * Un producto sin categoria conocida (bolsas viejas) no cuenta como prenda.
 */
export function priceCart(items: CartItem[]) {
  const hasGarment = items.some(
    (item) => item.category !== undefined && !isAddOnCategory(item.category),
  );
  const active = isBundleOfferEnabled() && hasGarment;

  const lines: PricedLine[] = items.map((item) => {
    const discounted = active && isAddOnCategory(item.category);
    const unitPrice = discounted ? applyBundleDiscount(item.price) : item.price;

    return {
      item,
      unitPrice,
      originalUnitPrice: item.price,
      discounted,
      lineTotal: unitPrice * item.quantity,
    };
  });

  const subtotal = lines.reduce(
    (sum, line) => sum + line.originalUnitPrice * line.item.quantity,
    0,
  );
  const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return {
    lines,
    subtotal,
    total,
    savings: subtotal - total,
    hasGarment,
    active,
  };
}
