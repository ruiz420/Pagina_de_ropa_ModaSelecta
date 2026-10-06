import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site-url";
import { getCatalogProducts } from "@/features/catalog/services/catalog.service";

// Se regenera sola para que los productos nuevos aparezcan en Google.
export const revalidate = 300;

const STATIC_PATHS = ["", "/catalogo", "/accesorios", "/maquillaje", "/nosotros"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const products = await getCatalogProducts();
  const now = new Date();

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${baseUrl}${path}`, lastModified: now })),
    ...products.map((product) => ({
      url: `${baseUrl}/producto/${product.slug}`,
      lastModified: now,
    })),
  ];
}
