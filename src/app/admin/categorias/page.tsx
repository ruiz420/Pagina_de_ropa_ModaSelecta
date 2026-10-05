import type { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/components/category-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CategoryWithCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export default async function AdminCategoriesPage() {
  let categories: CategoryWithCount[] = [];
  let dbError = false;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });
  } catch {
    dbError = true;
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Crear categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dbError ? (
              <p className="text-sm text-muted-foreground">
                Conecta PostgreSQL para administrar categorias reales.
              </p>
            ) : (
              <CategoryForm />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-[1fr_120px_120px]"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="text-muted-foreground">{category.slug}</p>
                </div>
                <p>Orden {category.order}</p>
                <p>{category._count.products} productos</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
