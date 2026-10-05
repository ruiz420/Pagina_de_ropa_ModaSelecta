"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/features/catalog/components/product-card";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";

/**
 * Fila horizontal de productos. En celular se desliza con el dedo (muestra
 * media tarjeta para invitar a seguir); las flechas aparecen solo en escritorio.
 */
export function ProductRail({
  title,
  eyebrow,
  description,
  href,
  products,
  tone = "default",
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  products: CatalogProduct[];
  tone?: "default" | "soft";
}) {
  const railRef = useRef<HTMLDivElement>(null);

  function scrollRail(direction: -1 | 1) {
    const rail = railRef.current;

    rail?.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.8, 260),
      behavior: "smooth",
    });
  }

  if (!products.length) {
    return null;
  }

  return (
    <section className={cn("py-12 md:py-20", tone === "soft" && "bg-brand-soft")}>
      <Container>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {href ? (
              <Link
                href={href}
                className="text-sm font-medium underline underline-offset-4 transition-colors hover:text-brand-strong"
              >
                Ver todo
              </Link>
            ) : null}
            <div className="hidden gap-2 md:flex">
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full"
                aria-label={`Anterior: ${title}`}
                onClick={() => scrollRail(-1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="rounded-full"
                aria-label={`Siguiente: ${title}`}
                onClick={() => scrollRail(1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div
          ref={railRef}
          className="scrollbar-none -mx-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:scroll-pl-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-pl-0 lg:px-0"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[44vw] max-w-[240px] shrink-0 snap-start sm:w-[240px]"
            >
              <ProductCard product={product} compact />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
