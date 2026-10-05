import type { Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;

export default async function AdminOrdersPage() {
  let orders: OrderWithItems[] = [];
  let dbError = false;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    dbError = true;
  }

  return (
    <AdminShell>
      <Card>
        <CardHeader>
          <CardTitle>Pedidos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dbError ? (
            <p className="text-sm text-muted-foreground">
              Conecta PostgreSQL para ver pedidos guardados.
            </p>
          ) : null}
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-[1fr_140px_130px_120px]"
            >
              <div>
                <p className="font-medium">{order.number}</p>
                <p className="text-muted-foreground">
                  {order.customerName ?? "Cliente sin nombre"}
                </p>
              </div>
              <p>{formatCurrency(Number(order.total))}</p>
              <p>{order.items.length} productos</p>
              <Badge>{order.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
