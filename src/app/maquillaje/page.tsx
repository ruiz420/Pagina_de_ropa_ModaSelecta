import { CategoryLanding } from "@/components/layout/category-landing";
import {
  getCatalogMakeupProducts,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";

export const metadata = {
  title: "Belleza y maquillaje",
  description: "Maquillaje para resaltar tu belleza: gloss, rubores, brochas y mas.",
};

export const revalidate = 300;

export default async function MakeupPage() {
  const [makeupProducts, allProducts] = await Promise.all([
    getCatalogMakeupProducts(),
    getCatalogProducts(),
  ]);
  const products = makeupProducts.length
    ? makeupProducts
    : allProducts.filter((product) =>
        product.tags.some((tag) => tag.toLowerCase().includes("maquillaje")),
      );

  return (
    <CategoryLanding
      eyebrow="Belleza"
      title="Brilla con tu tono favorito"
      description="Gloss, rubores, brochas y cuidado personal: tonos a la vista y precios claros para elegir sin dudar."
      image="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80"
      tone="blush"
      products={products}
      catalogHref="/catalogo?category=maquillaje"
      shortcuts={[
        { label: "Gloss", href: "/catalogo?search=gloss" },
        { label: "Rubor", href: "/catalogo?search=rubor" },
        { label: "Brochas", href: "/catalogo?search=brocha" },
      ]}
      emptyMessage="Estamos preparando la linea de belleza. Vuelve pronto o escribenos por WhatsApp."
    />
  );
}
