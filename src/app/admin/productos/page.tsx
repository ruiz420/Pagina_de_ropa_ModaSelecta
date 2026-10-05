import type { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/features/products/components/product-form";
import { ProductOfferControls } from "@/features/products/components/product-offer-controls";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: { include: { color: true; size: true } };
  };
}>;

export default async function AdminProductsPage() {
  let products: ProductWithCategory[] = [];
  let categories: Prisma.CategoryGetPayload<Record<string, never>>[] = [];
  let colors: Prisma.ColorGetPayload<Record<string, never>>[] = [];
  let sizes: Prisma.SizeGetPayload<Record<string, never>>[] = [];
  let dbError = false;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    [products, categories, colors, sizes] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: true,
          images: { orderBy: { order: "asc" } },
          variants: { include: { color: true, size: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.color.findMany({ orderBy: { name: "asc" } }),
      prisma.size.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Crear producto</CardTitle>
          </CardHeader>
          <CardContent>
            {dbError ? (
              <p className="text-sm text-muted-foreground">
                Configura PostgreSQL y ejecuta npm run db:push && npm run db:seed.
              </p>
            ) : (
              <ProductForm categories={categories} colors={colors} sizes={sizes} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-3 rounded-md border p-3 text-sm lg:grid-cols-[1fr_180px_1.3fr_120px]"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-muted-foreground">Ref {product.reference}</p>
                  <p className="mt-1 text-muted-foreground">
                    {product.category.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p>Venta {formatCurrency(Number(product.price))}</p>
                  <p>
                    Antes{" "}
                    {product.compareAtPrice
                      ? formatCurrency(Number(product.compareAtPrice))
                      : "Sin oferta"}
                  </p>
                  <p>
                    Compra{" "}
                    {product.cost
                      ? formatCurrency(Number(product.cost))
                      : "Sin costo"}
                  </p>
                </div>
                <ProductOfferControls
                  product={{
                    id: product.id,
                    name: product.name,
                    reference: product.reference,
                    description: product.description,
                    price: Number(product.price),
                    compareAtPrice: product.compareAtPrice
                      ? Number(product.compareAtPrice)
                      : undefined,
                    cost: product.cost ? Number(product.cost) : undefined,
                    stock: product.stock,
                    status: product.status,
                    categoryId: product.categoryId,
                    tags: product.tags,
                    images: product.images.map((image) => image.url),
                    colors: Array.from(
                      new Set(
                        product.variants
                          .map((variant) => variant.color?.name)
                          .filter((name): name is string => Boolean(name)),
                      ),
                    ),
                    sizes: Array.from(
                      new Set(
                        product.variants
                          .map((variant) => variant.size?.name)
                          .filter((name): name is string => Boolean(name)),
                      ),
                    ),
                  }}
                  categories={categories}
                  colors={colors}
                  sizes={sizes}
                />
                <div className="space-y-2">
                  <p>Stock {product.stock}</p>
                  <Badge>{product.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
