"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import {
  ColorSwatches,
  SizeButtons,
} from "@/features/catalog/components/option-pickers";
import { ProductPrice } from "@/features/catalog/components/product-price";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";

/**
 * Compra rapida: permite elegir talla y color sin salir del listado.
 */
export function QuickAddSheet({
  product,
  open,
  onClose,
  note,
}: {
  product: CatalogProduct;
  open: boolean;
  onClose: () => void;
  /** Aviso opcional bajo el precio (ej. descuento por combinar). */
  note?: string;
}) {
  const addToCart = useAddToCart();
  const [color, setColor] = useState(
    product.colors.length === 1 ? product.colors[0] : "",
  );
  const [size, setSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : "",
  );
  const [showError, setShowError] = useState(false);

  const missing =
    product.sizes.length > 1 && !size
      ? "Elige tu talla"
      : product.colors.length > 1 && !color
        ? "Elige un color"
        : null;

  function handleAdd() {
    if (missing) {
      setShowError(true);
      return;
    }

    addToCart(product, { color, size });
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} label={`Comprar ${product.name}`}>
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-[76px] shrink-0 overflow-hidden rounded-xl bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="76px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium leading-snug">{product.name}</p>
          <ProductPrice product={product} className="mt-1" />
          {note ? (
            <p className="mt-1 text-xs font-medium text-brand-strong">{note}</p>
          ) : null}
          <Link
            href={`/producto/${product.slug}`}
            className="mt-1 inline-block text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={onClose}
          >
            Ver detalles completos
          </Link>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mr-2 -mt-2"
          aria-label="Cerrar"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {product.colors.length > 1 ? (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">
            Color
            {color ? (
              <span className="font-normal text-muted-foreground">: {color}</span>
            ) : null}
          </p>
          <ColorSwatches
            colors={product.colors}
            value={color}
            onChange={(next) => {
              setColor(next);
              setShowError(false);
            }}
          />
        </div>
      ) : null}

      {product.sizes.length > 1 ? (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">
            Talla
            {size ? (
              <span className="font-normal text-muted-foreground">: {size}</span>
            ) : null}
          </p>
          <SizeButtons
            sizes={product.sizes}
            value={size}
            onChange={(next) => {
              setSize(next);
              setShowError(false);
            }}
          />
        </div>
      ) : null}

      {showError && missing ? (
        <p role="alert" className="mt-3 text-sm font-medium text-discount">
          {missing} para continuar.
        </p>
      ) : null}

      <Button
        type="button"
        variant="cta"
        size="lg"
        className="mt-6 w-full"
        onClick={handleAdd}
      >
        Agregar a la bolsa
      </Button>
    </Sheet>
  );
}
