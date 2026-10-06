import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/config/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/catalogo", "/accesorios", "/maquillaje", "/producto"],
      disallow: ["/admin"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
