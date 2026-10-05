"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import {
  AlertTriangle,
  Boxes,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Stat = {
  label: string;
  value: string;
  helper: string;
  icon: "products" | "categories" | "orders" | "users" | "warning" | "sales";
  href: string;
};

type ChartPoint = {
  day: string;
  pedidos: number;
  ventas: number;
};

type RecentOrder = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  status: string;
};

type LowStockProduct = {
  id: string;
  name: string;
  reference: string;
  stock: number;
};

const icons = {
  products: Package,
  categories: Boxes,
  orders: ShoppingCart,
  users: Users,
  warning: AlertTriangle,
  sales: TrendingUp,
};

export function DashboardOverview({
  stats,
  orderData,
  recentOrders,
  lowStockProducts,
}: {
  stats: Stat[];
  orderData: ChartPoint[];
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Resumen real de productos, pedidos, usuarios e inventario.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = icons[stat.icon];

          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="h-full border-border/80 bg-card transition-all hover:-translate-y-0.5 hover:bg-muted/40 hover:shadow-md">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stat.helper}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pedidos de los ultimos 7 dias</CardTitle>
            <Button asChild variant="outline">
              <Link href="/admin/pedidos">Ver pedidos</Link>
            </Button>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={orderData}>
                <defs>
                  <linearGradient id="orders" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#c01867" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#c01867" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value, name) =>
                    name === "ventas"
                      ? formatCurrency(Number(value))
                      : Number(value)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="pedidos"
                  stroke="#c01867"
                  fill="url(#orders)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventario por revisar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[1fr_auto] gap-3 rounded-md border p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-muted-foreground">
                      Ref {product.reference}
                    </p>
                  </div>
                  <Badge className="bg-muted">{product.stock} und</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay productos con stock bajo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pedidos recientes</CardTitle>
          <Button asChild variant="outline">
            <Link href="/admin/pedidos">Gestionar pedidos</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentOrders.length ? (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="grid gap-3 rounded-md border p-3 text-sm md:grid-cols-[1fr_160px_120px]"
              >
                <div>
                  <p className="font-medium">{order.number}</p>
                  <p className="text-muted-foreground">{order.customerName}</p>
                </div>
                <p>{formatCurrency(order.total)}</p>
                <Badge>{order.status}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Aun no hay pedidos guardados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
