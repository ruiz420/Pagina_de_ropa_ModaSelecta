import { cn, formatCurrency } from "@/lib/utils";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { getDiscountPercent, isOnSale } from "@/features/catalog/lib/product-signals";

const SIZES = {
  sm: { price: "text-sm", compare: "text-xs" },
  md: { price: "text-base", compare: "text-sm" },
  lg: { price: "text-3xl", compare: "text-base" },
} as const;

/** Precio con precio anterior tachado y % de descuento cuando hay oferta. */
export function ProductPrice({
  product,
  size = "md",
  className,
}: {
  product: Pick<CatalogProduct, "price" | "compareAtPrice">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const onSale = isOnSale(product);
  const discount = getDiscountPercent(product);

  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span
        className={cn(
          "font-semibold tabular-nums",
          SIZES[size].price,
          onSale && "text-discount",
        )}
      >
        {formatCurrency(product.price)}
      </span>
      {onSale ? (
        <>
          <span
            className={cn(
              "tabular-nums text-muted-foreground line-through",
              SIZES[size].compare,
            )}
          >
            {formatCurrency(Number(product.compareAtPrice))}
          </span>
          {size === "lg" && discount ? (
            <span className="text-sm font-semibold text-discount">
              Ahorras {discount}%
            </span>
          ) : null}
        </>
      ) : null}
    </p>
  );
}
