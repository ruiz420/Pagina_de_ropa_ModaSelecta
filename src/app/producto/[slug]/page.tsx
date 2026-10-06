import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { ProductImageGallery } from "@/features/catalog/components/product-image-gallery";
import { ProductPrice } from "@/features/catalog/components/product-price";
import { ProductPurchaseActions } from "@/features/catalog/components/product-purchase-actions";
import { ProductRail } from "@/features/catalog/components/product-rail";
import { ProductTrust } from "@/features/catalog/components/product-trust";
import {
  RecentlyViewed,
  ViewTracker,
} from "@/features/catalog/components/recently-viewed";
import {
  getProductBadges,
  getSoldLabel,
  isAddOnCategory,
} from "@/features/catalog/lib/product-signals";
import {
  getCatalogAccessoryProducts,
  getCatalogCategories,
  getCatalogProductBySlug,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";
import { STORE } from "@/config/store";
import { isBundleOfferEnabled } from "@/features/cart/lib/pricing";
import { formatCurrency } from "@/lib/utils";

// Los productos nuevos que no estaban al compilar se generan al primer pedido.
export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getCatalogProducts();

  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) {
    return {};
  }

  const description =
    product.description?.slice(0, 160) ??
    `${product.name} - ${formatCurrency(product.price)}. Pide por WhatsApp.`;

  return {
    title: product.name,
    description,
    openGraph: { title: product.name, description, images: [product.image] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, products, accessoryProducts, categories] = await Promise.all([
    getCatalogProductBySlug(slug),
    getCatalogProducts(),
    getCatalogAccessoryProducts(8),
    getCatalogCategories(),
  ]);

  if (!product) {
    notFound();
  }

  const categorySlug = categories.find(
    (category) => category.name === product.category,
  )?.slug;
  const recommendedProducts = products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      if (a.category === product.category && b.category !== product.category) {
        return -1;
      }

      if (a.category !== product.category && b.category === product.category) {
        return 1;
      }

      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);
  const crossSellProducts = accessoryProducts.filter(
    (item) => item.id !== product.id,
  );
  const badges = getProductBadges(product, 3);
  const soldLabel = getSoldLabel(product);
  const bundleOfferActive = isBundleOfferEnabled();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-24 lg:pb-0">
        <Container className="py-5 md:py-8">
          <nav
            aria-label="Ruta"
            className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground md:mb-6"
          >
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href={
                categorySlug ? `/catalogo?category=${categorySlug}` : "/catalogo"
              }
              className="hover:text-foreground"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>

          <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
            <ProductImageGallery images={product.images} name={product.name} />
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
                  {product.category}
                </p>
                {badges.map((badge) => (
                  <Badge key={badge.label} variant={badge.tone}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display mt-3 text-4xl font-medium leading-tight tracking-tight">
                {product.name}
              </h1>
              <ProductPrice product={product} size="lg" className="mt-4" />
              {bundleOfferActive && isAddOnCategory(product.category) ? (
                <p className="mt-3 inline-flex rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-brand-strong">
                  {STORE.bundleOffer.percent}% de descuento al llevarlo con una prenda
                </p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                Ref {product.reference}
                {soldLabel ? ` · ${soldLabel}` : ""}
              </p>
              {product.description ? (
                <p className="mt-5 max-w-prose leading-7 text-foreground/80">
                  {product.description}
                </p>
              ) : null}

              <div className="mt-7">
                <ProductPurchaseActions product={product} />
              </div>
              <div className="mt-8">
                <ProductTrust />
              </div>
            </div>
          </section>
        </Container>

        <ProductRail
          eyebrow="Combina con"
          title="No olvides combinarlo con..."
          description={`Accesorios que combinan con ${product.name}.`}
          href="/accesorios"
          products={crossSellProducts}
        />
        <ProductRail
          tone="soft"
          eyebrow="Para ti"
          title="Tambien te puede gustar"
          description={`Mas de ${product.category} y piezas parecidas a esta.`}
          products={recommendedProducts}
        />
        <RecentlyViewed products={products} excludeId={product.id} />
        <ViewTracker productId={product.id} productName={product.name} />
      </main>
      <SiteFooter />
    </div>
  );
}
