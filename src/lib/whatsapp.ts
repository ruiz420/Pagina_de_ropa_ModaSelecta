import { STORE, buildStoreWhatsappUrl } from "@/config/store";
import { priceCart } from "@/features/cart/lib/pricing";
import type { CartItem } from "@/features/cart/store/cart-store";
import { formatCurrency } from "@/lib/utils";

type CustomerDraft = {
  name?: string;
  city?: string;
};

export function buildWhatsappMessage(
  items: CartItem[],
  customer?: CustomerDraft,
) {
  const { lines: priced, savings, total } = priceCart(items);
  const lines = priced.map(({ item, unitPrice, discounted }) => {
    const color = item.color ? ` ${item.color}` : "";
    const size = item.size ? ` Talla ${item.size}` : "";
    const note = discounted
      ? ` (con ${STORE.bundleOffer.percent}% por combinar con una prenda)`
      : "";

    return `- ${item.name} Ref ${item.reference}${color}${size} x${item.quantity} - ${formatCurrency(unitPrice)} c/u${note}`;
  });

  return [
    "Hola.",
    "",
    "Quiero confirmar el siguiente pedido.",
    "",
    ...lines,
    "",
    ...(savings > 0
      ? [`Descuento por combinar: -${formatCurrency(savings)}`]
      : []),
    `Total de productos: ${formatCurrency(total)} (envio por confirmar)`,
    "",
    `Nombre: ${customer?.name ?? ""}`,
    `Ciudad: ${customer?.city ?? ""}`,
  ].join("\n");
}

export function buildWhatsappUrl(message: string) {
  return buildStoreWhatsappUrl(message);
}
