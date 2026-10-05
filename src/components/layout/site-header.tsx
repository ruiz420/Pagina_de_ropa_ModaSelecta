import Link from "next/link";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { Container } from "@/components/ui/container";
import { STORE } from "@/config/store";
import { CartDrawer } from "@/features/cart/components/cart-drawer";
import { HeaderSearch } from "@/features/catalog/components/header-search";
import { isAddOnCategory } from "@/features/catalog/lib/product-signals";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";
import { FavoritesLink } from "@/features/favorites/components/favorites-link";

const navLinks = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/catalogo?offer=true", label: "Ofertas" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/maquillaje", label: "Belleza" },
];

export async function SiteHeader() {
  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts(),
  ]);
  // Complementos disponibles para ofrecer con descuento junto a una prenda.
  const addOns = products
    .filter((product) => isAddOnCategory(product.category) && product.stock > 0)
    .slice(0, 12);
  // Solo lo necesario para buscar: nada de costos ni precios mayoristas.
  const searchItems = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    image: product.image,
    price: product.price,
    category: product.category,
    reference: product.reference,
    tags: product.tags,
  }));

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between gap-2 md:h-20">
          <div className="flex items-center gap-1">
            <MobileMenu categories={categories} links={navLinks} />
            <Link
              href="/"
              className="font-display text-2xl font-medium tracking-tight sm:text-[28px]"
            >
              {STORE.name}
            </Link>
          </div>
          <nav
            aria-label="Principal"
            className="hidden items-center gap-1 text-sm md:flex"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center">
            <HeaderSearch
              items={searchItems}
              suggestions={categories.map((category) => category.name)}
            />
            <FavoritesLink />
            <CartDrawer addOns={addOns} />
          </div>
        </Container>
      </header>
    </>
  );
}
