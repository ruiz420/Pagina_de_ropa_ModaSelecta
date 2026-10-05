"use client";

import { MessageCircle, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { buildStoreWhatsappUrl } from "@/config/store";
import { cn } from "@/lib/utils";
import { useAddToCart } from "@/features/cart/hooks/use-add-to-cart";
import {
  ColorSwatches,
  SizeButtons,
} from "@/features/catalog/components/option-pickers";
import { ProductPrice } from "@/features/catalog/components/product-price";
import { ShareButton } from "@/features/catalog/components/share-button";
import { SizeGuideButton } from "@/features/catalog/components/size-guide-sheet";
import { track } from "@/lib/analytics";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { getAvailability } from "@/features/catalog/lib/product-signals";
import { FavoriteButton } from "@/features/favorites/components/favorite-button";

export function ProductPurchaseActions({ product }: { product: CatalogProduct }) {
  const addToCart = useAddToCart();
  const availability = getAvailability(product);
  const isOut = availability.status === "out";
  const [color, setColor] = useState(
    product.colors.length === 1 ? product.colors[0] : "",
  );
  const [size, setSize] = useState(
    product.sizes.length === 1 ? product.sizes[0] : "",
  );
  const [showError, setShowError] = useState(false);
  const [isCtaVisible, setIsCtaVisible] = useState(true);
  const ctaRef = useRef<HTMLDivElement>(null);

  // La barra fija de compra aparece cuando el boton principal sale de pantalla.
  useEffect(() => {
    const target = ctaRef.current;

    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) =>
      setIsCtaVisible(entry.isIntersecting),
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, []);

  const missing =
    product.sizes.length > 1 && !size
      ? "Elige tu talla"
      : product.colors.length > 1 && !color
        ? "Elige un color"
        : null;

  function handleAdd() {
    if (missing) {
      setShowError(true);
      ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    addToCart(product, { color, size });
  }

  const askUrl = buildStoreWhatsappUrl(
    isOut
      ? `Hola, quiero saber cuando vuelve a haber ${product.name} (Ref ${product.reference}).`
      : `Hola, tengo una pregunta sobre ${product.name} (Ref ${product.reference}).`,
  );

  return (
    <div className="space-y-6">
      {product.colors.length ? (
        <div>
          <p className="mb-3 text-sm font-medium">
            Color
            {color ? (
              <span className="font-normal text-muted-foreground">: {color}</span>
            ) : null}
          </p>
          {product.colors.length > 1 ? (
            <ColorSwatches
              colors={product.colors}
              value={color}
              onChange={(next) => {
                setColor(next);
                setShowError(false);
              }}
            />
          ) : null}
        </div>
      ) : null}

      {product.sizes.length ? (
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              Talla
              {size ? (
                <span className="font-normal text-muted-foreground">: {size}</span>
              ) : null}
            </p>
            <SizeGuideButton productName={product.name} />
          </div>
          {product.sizes.length > 1 ? (
            <SizeButtons
              sizes={product.sizes}
              value={size}
              onChange={(next) => {
                setSize(next);
                setShowError(false);
              }}
            />
          ) : null}
        </div>
      ) : null}

      <p className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            availability.status === "in" && "bg-success",
            availability.status === "low" && "bg-discount",
            availability.status === "out" && "bg-muted-foreground",
          )}
        />
        <span
          className={cn(
            "font-medium",
            availability.status === "in" && "text-success",
            availability.status === "low" && "text-discount",
          )}
        >
          {availability.status === "low"
            ? `${availability.label} - pocas unidades`
            : availability.label}
        </span>
      </p>

      <div ref={ctaRef} className="space-y-3">
        {showError && missing ? (
          <p role="alert" className="text-sm font-medium text-discount">
            {missing} para continuar.
          </p>
        ) : null}
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="w-full"
          disabled={isOut}
          onClick={handleAdd}
        >
          <ShoppingBag className="h-5 w-5" />
          {isOut ? "Agotado" : "Agregar a la bolsa"}
        </Button>
        <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
          <FavoriteButton
            productId={product.id}
            productName={product.name}
            className="h-11 w-11 border border-input bg-background shadow-none"
          />
          <ShareButton title={product.name} />
          <Button asChild variant="outline" className="gap-2">
            <a
              href={askUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() =>
                track("ask_whatsapp", {
                  topic: isOut ? "aviso_stock" : "pregunta",
                  product: product.name,
                })
              }
            >
              <MessageCircle className="h-4 w-4" />
              {isOut ? "Avisarme" : "Preguntar"}
            </a>
          </Button>
        </div>
      </div>

      {/* Barra fija en celular: el boton de compra siempre al alcance del pulgar. */}
      {!isOut ? (
        <div
          aria-hidden={isCtaVisible}
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t bg-background/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lift backdrop-blur transition-transform duration-300 lg:hidden",
            isCtaVisible ? "translate-y-full" : "translate-y-0",
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              {product.name}
            </p>
            <ProductPrice product={product} size="md" />
          </div>
          <Button
            type="button"
            variant="cta"
            tabIndex={isCtaVisible ? -1 : 0}
            onClick={handleAdd}
          >
            {missing ?? "Agregar a la bolsa"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
