import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { STORE } from "@/config/store";
import { ProductPrice } from "@/features/catalog/components/product-price";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";

/**
 * Hero editorial: titular grande, foto en arco y una tarjeta flotante con un
 * producto real, para que desde el primer vistazo se pueda comprar algo.
 */
export function HomeHero({ featured }: { featured?: CatalogProduct }) {
  return (
    <section className="relative overflow-hidden bg-brand-soft">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-champagne/50 md:h-[28rem] md:w-[28rem]"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-brand/10"
      />
      <Container className="relative grid items-center gap-12 py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:py-20 lg:py-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong backdrop-blur">
            Ropa · Accesorios · Belleza
          </p>
          <h1 className="font-display text-[3.4rem] font-medium leading-[0.95] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            Descubre tu proximo{" "}
            <em className="font-normal italic text-brand">estilo</em>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-foreground/75">
            Elegimos prendas, accesorios y belleza para que armes tu look en
            minutos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="lg">
              <Link href="/catalogo">
                Explorar coleccion
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full border-foreground/30 bg-transparent"
            >
              <Link href="/catalogo?offer=true">Ver ofertas</Link>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] bg-muted shadow-lift">
            <Image
              src={STORE.heroImage}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          {featured ? (
            <Link
              href={`/producto/${featured.slug}`}
              className="absolute -left-3 bottom-8 flex w-[15.5rem] items-center gap-3 rounded-2xl bg-card p-2.5 shadow-lift transition-transform hover:-translate-y-1 md:-left-10"
            >
              <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Favorito de la tienda
                </span>
                <span className="block truncate text-sm font-medium">
                  {featured.name}
                </span>
                <ProductPrice product={featured} size="sm" />
              </span>
            </Link>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
