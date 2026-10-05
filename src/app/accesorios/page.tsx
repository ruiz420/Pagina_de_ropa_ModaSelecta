import { CategoryLanding } from "@/components/layout/category-landing";
import {
  getCatalogAccessoryProducts,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";

export const metadata = {
  title: "Accesorios",
  description: "Accesorios para completar tu look con detalles elegantes.",
};

export const dynamic = "force-dynamic";

export default async function AccessoriesPage() {
  const [accessoryProducts, allProducts] = await Promise.all([
    getCatalogAccessoryProducts(12),
    getCatalogProducts(),
  ]);
  const products = accessoryProducts.length
    ? accessoryProducts
    : allProducts.filter((product) =>
        product.tags.some((tag) => tag.toLowerCase().includes("accesorio")),
      );

  return (
    <CategoryLanding
      eyebrow="Accesorios"
      title="El detalle que transforma tu outfit"
      description="Collares, cinturones y complementos para darle un toque especial a tus prendas favoritas."
      image="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=1400&q=80"
      tone="cream"
      products={products}
      catalogHref="/catalogo?category=accesorios"
      emptyMessage="Estamos preparando los accesorios. Vuelve pronto o escribenos por WhatsApp."
    />
  );
}
