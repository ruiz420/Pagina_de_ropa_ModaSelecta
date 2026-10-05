import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import { cn, formatCurrency } from "@/lib/utils";

/** Plantilla de las vitrinas por categoria (Accesorios, Belleza): una sola fuente de estilo. */
export function CategoryLanding({
  eyebrow,
  title,
  description,
  image,
  tone = "cream",
  products,
  catalogHref,
  shortcuts = [],
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  tone?: "cream" | "blush";
  products: CatalogProduct[];
  catalogHref: string;
  shortcuts?: { label: string; href: string }[];
  emptyMessage: string;
}) {
  const startPrice = products.length
    ? Math.min(...products.map((product) => product.price))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className={cn(tone === "blush" ? "bg-brand-soft" : "bg-secondary")}>
          <Container className="grid items-center gap-8 py-10 md:grid-cols-2 md:gap-14 md:py-16">
            <div className="order-2 md:order-1">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                {eyebrow}
              </p>
              <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-foreground/75">
                {description}
              </p>
              {products.length ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  Desde{" "}
                  <span className="font-semibold tabular-nums text-foreground">
                    {formatCurrency(startPrice)}
                  </span>
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="cta" size="lg">
                  <Link href="#productos">
                    Ver productos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full bg-transparent">
                  <Link href={catalogHref}>Filtrar en el catalogo</Link>
                </Button>
              </div>
              {shortcuts.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {shortcuts.map((shortcut) => (
                    <Link
                      key={shortcut.label}
                      href={shortcut.href}
                      className="rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:border-foreground/50"
                    >
                      {shortcut.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-3xl bg-muted md:order-2 md:aspect-[4/5]">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </Container>
        </section>

        <section id="productos" className="scroll-mt-24 py-10 md:py-14">
          <Container>
            {products.length ? (
              <ProductGrid products={products} />
            ) : (
              <div className="mx-auto max-w-md rounded-3xl border bg-card p-10 text-center">
                <p className="font-display text-2xl font-medium">
                  Muy pronto
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {emptyMessage}
                </p>
              </div>
            )}
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
