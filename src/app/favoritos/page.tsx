import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/ui/container";
import { getCatalogProducts } from "@/features/catalog/services/catalog.service";
import { FavoritesView } from "@/features/favorites/components/favorites-view";

export const metadata = {
  title: "Mis favoritos",
  description: "Los productos que guardaste para decidir con calma.",
};

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const products = await getCatalogProducts();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <div className="bg-brand-soft">
          <Container className="py-10 md:py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              Guardados
            </p>
            <h1 className="font-display text-5xl font-medium leading-none tracking-tight md:text-7xl">
              Mis favoritos
            </h1>
          </Container>
        </div>
        <Container className="pb-16 pt-10">
          <FavoritesView products={products} />
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
