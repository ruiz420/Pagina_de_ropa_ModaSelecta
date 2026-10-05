import type { MetadataRoute } from "next";
import { catalogProducts } from "@/features/catalog/data/mock-catalog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/catalogo`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/accesorios`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/maquillaje`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
    },
    ...catalogProducts.map((product) => ({
      url: `${baseUrl}/producto/${product.slug}`,
      lastModified: new Date(),
    })),
  ];
}
