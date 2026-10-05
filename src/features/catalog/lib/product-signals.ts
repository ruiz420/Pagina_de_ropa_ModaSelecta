import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { slugifyText } from "@/lib/utils";

/**
 * Senales visibles en tarjetas y pagina de producto. Todas salen de datos
 * reales del producto (precio, stock, etiquetas, vendidos): nada se inventa.
 */

export const LOW_STOCK_LIMIT = 5;
// Mostrar "N vendidos" solo si la cifra aporta confianza y no deja mal parada a la tienda.
const MIN_SOLD_TO_SHOW = 5;

export type BadgeTone = "sale" | "ink" | "soft" | "glass";

export type ProductBadge = { label: string; tone: BadgeTone };

export function isOnSale(product: Pick<CatalogProduct, "price" | "compareAtPrice">) {
  return (
    Boolean(product.compareAtPrice) &&
    Number(product.compareAtPrice) > product.price
  );
}

export function getDiscountPercent(
  product: Pick<CatalogProduct, "price" | "compareAtPrice">,
) {
  if (!isOnSale(product)) {
    return null;
  }

  const compareAt = Number(product.compareAtPrice);
  return Math.round(((compareAt - product.price) / compareAt) * 100);
}

/** Compara etiquetas sin importar mayusculas, tildes ni guiones ("Segunda mano" = "segunda-mano"). */
export function normalizeTag(tag: string) {
  return slugifyText(tag);
}

export function hasTag(product: Pick<CatalogProduct, "tags">, tag: string) {
  const wanted = normalizeTag(tag);
  return product.tags.some((item) => normalizeTag(item) === wanted);
}

export function getAvailability(product: Pick<CatalogProduct, "stock">) {
  if (product.stock <= 0) {
    return { status: "out" as const, label: "Agotado" };
  }

  if (product.stock <= LOW_STOCK_LIMIT) {
    return {
      status: "low" as const,
      label: product.stock === 1 ? "Ultima unidad" : `Quedan ${product.stock}`,
    };
  }

  return { status: "in" as const, label: "Disponible" };
}

export function getProductBadges(product: CatalogProduct, max = 2): ProductBadge[] {
  const badges: ProductBadge[] = [];
  const discount = getDiscountPercent(product);
  const availability = getAvailability(product);

  if (availability.status === "out") {
    badges.push({ label: "Agotado", tone: "ink" });
  }

  if (discount) {
    badges.push({ label: `-${discount}%`, tone: "sale" });
  }

  if (availability.status === "low") {
    badges.push({ label: "Ultimas unidades", tone: "glass" });
  }

  // Estado del producto: clave en reventa. Sale de las etiquetas que carga la tienda.
  if (hasTag(product, "nuevo") || product.badge?.toLowerCase() === "nuevo") {
    badges.push({ label: "Nuevo", tone: "glass" });
  } else if (hasTag(product, "como nuevo")) {
    badges.push({ label: "Como nuevo", tone: "glass" });
  } else if (hasTag(product, "vintage")) {
    badges.push({ label: "Vintage", tone: "glass" });
  } else if (hasTag(product, "segunda mano") || hasTag(product, "usado")) {
    badges.push({ label: "Segunda mano", tone: "glass" });
  }

  if (hasTag(product, "tendencia")) {
    badges.push({ label: "Tendencia", tone: "soft" });
  }

  return badges.slice(0, max);
}

export function getSoldLabel(product: Pick<CatalogProduct, "soldCount">) {
  const sold = product.soldCount ?? 0;
  return sold >= MIN_SOLD_TO_SHOW ? `${sold} vendidos` : null;
}

export function hasChoices(product: Pick<CatalogProduct, "colors" | "sizes">) {
  return product.colors.length > 1 || product.sizes.length > 1;
}

/** Accesorios y belleza: los productos que se ofrecen como complemento de una prenda. */
export function isAddOnCategory(category?: string) {
  if (!category) {
    return false;
  }

  const normalized = slugifyText(category);
  return ["accesorio", "accessory", "maquillaje", "makeup", "belleza"].some(
    (word) => normalized.includes(word),
  );
}
