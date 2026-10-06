import {
  ArrowRight,
  Heart,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { buildStoreWhatsappUrl } from "@/config/store";
import { HowItWorks } from "@/components/layout/how-it-works";
import { MarqueeStrip } from "@/components/layout/marquee-strip";
import { ForYou } from "@/features/catalog/components/for-you";
import { HomeHero } from "@/features/catalog/components/home-hero";
import { PersonalizationControls } from "@/features/catalog/components/personalization-controls";
import { ProductRail } from "@/features/catalog/components/product-rail";
import { RecentlyViewed } from "@/features/catalog/components/recently-viewed";
import type { CatalogProduct } from "@/features/catalog/data/mock-catalog";
import {
  getDiscountPercent,
  hasTag,
  isOnSale,
} from "@/features/catalog/lib/product-signals";
import {
  getCatalogAccessoryProducts,
  getCatalogCategories,
  getCatalogCollections,
  getCatalogMakeupProducts,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";
import { cn, formatCurrency } from "@/lib/utils";

const TRUST_POINTS = [
  {
    icon: MessageCircle,
    title: "Pedido por WhatsApp",
    text: "Sin registros ni formularios largos.",
  },
  {
    icon: ShieldCheck,
    title: "Confirmamos antes de que pagues",
    text: "Talla, color y disponibilidad contigo.",
  },
  {
    icon: Heart,
    title: "Guarda tus favoritos",
    text: "Sin crear cuenta, en tu mismo celular.",
  },
];

// Se regenera sola: sin esto la pagina quedaria con los datos del dia de la compilacion.
export const revalidate = 300;

export default async function Home() {
  const [products, categories, collections, makeupProducts, accessoryProducts] =
    await Promise.all([
      getCatalogProducts(),
      getCatalogCategories(),
      getCatalogCollections(),
      getCatalogMakeupProducts(),
      getCatalogAccessoryProducts(12),
    ]);
  const offerProducts = products.filter(isOnSale).slice(0, 10);
  const maxDiscount = Math.max(
    0,
    ...offerProducts.map((product) => getDiscountPercent(product) ?? 0),
  );
  const featuredProduct = products.find(
    (product) =>
      product.stock > 0 &&
      !["maquillaje", "accesorios"].includes(product.category.toLowerCase()),
  );
  const clothingProducts = products
    .filter(
      (product) =>
        !["maquillaje", "accesorios"].includes(product.category.toLowerCase()),
    )
    .slice(0, 10);
  const taggedTrending = products.filter((product) => hasTag(product, "tendencia"));
  // Una fila con uno o dos productos se ve vacia: solo se muestra con 3 o mas.
  const trendingProducts = taggedTrending.length >= 3 ? taggedTrending.slice(0, 10) : [];
  // El mosaico tiene 5 espacios: una categoria grande y cuatro pequenas.
  const categoryTiles = categories.slice(0, 5).map((category) => ({
    ...category,
    image:
      category.imageUrl ??
      products.find((product) => product.category === category.name)?.image,
  }));
  const look = buildLook(clothingProducts[0], accessoryProducts[0], makeupProducts[0]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <HomeHero featured={featuredProduct} />
        <MarqueeStrip
          words={["Ropa", "Accesorios", "Belleza", "Tu look completo", "Pide por WhatsApp"]}
        />

        <section className="border-b bg-card">
          <Container className="grid gap-4 py-5 sm:grid-cols-3 sm:gap-6">
            {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </Container>
        </section>

        <section className="py-14 md:py-20">
          <Container>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Explora
                </p>
                <h2 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
                  Compra por categoria
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="hidden text-sm font-medium underline underline-offset-4 hover:text-brand-strong sm:block"
              >
                Ver todo
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-4 md:gap-4">
              {categoryTiles.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/catalogo?category=${category.slug}`}
                  className={cn(
                    "group relative overflow-hidden rounded-3xl bg-secondary",
                    index === 0
                      ? "col-span-2 aspect-[16/11] md:row-span-2 md:aspect-auto"
                      : "aspect-[3/4] md:aspect-auto",
                  )}
                >
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes={
                        index === 0
                          ? "(min-width: 768px) 50vw, 100vw"
                          : "(min-width: 768px) 25vw, 50vw"
                      }
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p
                      className={cn(
                        "font-display font-medium leading-tight",
                        index === 0 ? "text-3xl md:text-4xl" : "text-xl",
                      )}
                    >
                      {category.name}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/85 transition-all group-hover:gap-2">
                      Explorar
                      <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {collections.length ? (
          <section className="pb-4">
            <Container>
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Por estilo
                </p>
                <h2 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
                  Colecciones
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {collections.map((collection) => (
                  <Link
                    key={collection.slug}
                    href={`/catalogo?collection=${collection.slug}`}
                    className="group rounded-full border bg-card px-6 py-3.5 transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                  >
                    <span className="font-display text-xl font-medium">
                      {collection.label}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground group-hover:text-background/70">
                      {collection.count}
                    </span>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        <ProductRail
          eyebrow="Tendencia"
          title="Lo que se esta llevando"
          href="/catalogo?collection=tendencia"
          products={trendingProducts}
        />
        <ProductRail
          eyebrow="Ropa"
          title="Prendas para estrenar"
          description="Elige tu talla y color en un toque."
          href="/catalogo"
          products={clothingProducts}
        />

        {look ? (
          <section className="py-10 md:py-14">
            <Container className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
                <Image
                  src={look.cover}
                  alt={look.base.name}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  Inspiracion
                </p>
                <h2 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-5xl">
                  Completa el look
                </h2>
                <p className="mt-4 max-w-md leading-7 text-muted-foreground">
                  Una prenda, un detalle y un toque de brillo. Asi se arma un
                  outfit listo para salir.
                </p>
                <ul className="mt-6 divide-y rounded-2xl border bg-card">
                  {look.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/producto/${item.slug}`}
                        className="group flex items-center gap-4 p-3 transition-colors hover:bg-muted/60"
                      >
                        <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                            {item.category}
                          </span>
                          <span className="block truncate font-medium">
                            {item.name}
                          </span>
                          <span className="text-sm tabular-nums">
                            {formatCurrency(item.price)}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Button asChild variant="cta" size="lg">
                    <Link href={`/producto/${look.base.slug}`}>
                      Ver la prenda
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Look completo:{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(look.total)}
                    </span>
                  </p>
                </div>
              </div>
            </Container>
          </section>
        ) : null}

        {offerProducts.length ? (
          <section className="py-4">
            <Container>
              <div className="relative overflow-hidden rounded-[2rem] bg-brand p-8 text-brand-foreground md:p-14">
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"
                />
                <div
                  aria-hidden
                  className="absolute -bottom-24 right-24 h-56 w-56 rounded-full border border-white/25"
                />
                <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                      Ofertas
                    </p>
                    <h2 className="font-display text-5xl font-medium leading-none tracking-tight md:text-7xl">
                      Hasta <em className="font-normal italic">-{maxDiscount}%</em>
                    </h2>
                    <p className="mt-4 max-w-md text-white/85">
                      {offerProducts.length}{" "}
                      {offerProducts.length === 1 ? "producto" : "productos"} con el
                      precio anterior y el ahorro a la vista.
                    </p>
                  </div>
                  <Button asChild variant="light" size="lg">
                    <Link href="/catalogo?offer=true">
                      Ver ofertas
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Container>
          </section>
        ) : null}
        <ProductRail
          eyebrow="Ofertas"
          title="Precios que alegran"
          href="/catalogo?offer=true"
          products={offerProducts}
        />
        <ProductRail
          eyebrow="Accesorios"
          title="Detalles que completan"
          description="El toque final para cualquier outfit."
          href="/accesorios"
          products={accessoryProducts}
        />
        <ProductRail
          tone="soft"
          eyebrow="Belleza"
          title="Brillo y color"
          description="Tonos para resaltar lo que ya eres."
          href="/maquillaje"
          products={makeupProducts}
        />

        <HowItWorks />

        <ForYou products={products} />
        <RecentlyViewed products={products} />
        <PersonalizationControls />

        <section className="pb-4 pt-6">
          <Container>
            <div className="flex flex-col items-start gap-6 rounded-3xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:justify-between md:p-12">
              <div>
                <h2 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                  ¿Dudas con tu talla o color?
                </h2>
                <p className="mt-2 max-w-md text-primary-foreground/80">
                  Escribenos y te ayudamos a elegir antes de pedir.
                </p>
              </div>
              <Button asChild variant="cta" size="lg">
                <a
                  href={buildStoreWhatsappUrl(
                    "Hola, necesito ayuda para elegir una prenda.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-5 w-5" />
                  Hablar por WhatsApp
                </a>
              </Button>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

/** Arma un look con productos reales: una prenda + un accesorio + un producto de belleza. */
function buildLook(
  base?: CatalogProduct,
  accessory?: CatalogProduct,
  beauty?: CatalogProduct,
) {
  if (!base) {
    return null;
  }

  const items = [base, accessory, beauty].filter(
    (item): item is CatalogProduct => Boolean(item),
  );

  return {
    base,
    items,
    cover: base.images[1] ?? base.image,
    total: items.reduce((sum, item) => sum + item.price, 0),
  };
}
