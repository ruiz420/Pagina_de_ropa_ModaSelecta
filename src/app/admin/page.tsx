import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import type { ComponentProps } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { DashboardOverview } from "@/features/admin/components/dashboard-overview";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

type DashboardData = ComponentProps<typeof DashboardOverview>;

export default async function AdminPage() {
  const dashboardData = await getDashboardData();

  return (
    <AdminShell>
      <DashboardOverview {...dashboardData} />
    </AdminShell>
  );
}

async function getDashboardData(): Promise<DashboardData> {
  const sevenDaysAgo = subDays(new Date(), 6);

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    const [
      productCount,
      categoryCount,
      orderCount,
      userCount,
      lowStockCount,
      pendingOrderCount,
      ordersLastSevenDays,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.user.count(),
      prisma.product.count({
        where: { OR: [{ stock: { lte: 5 } }, { status: "OUT_OF_STOCK" }] },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, total: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          number: true,
          customerName: true,
          total: true,
          status: true,
        },
      }),
      prisma.product.findMany({
        where: { OR: [{ stock: { lte: 5 } }, { status: "OUT_OF_STOCK" }] },
        orderBy: { stock: "asc" },
        take: 6,
        select: { id: true, name: true, reference: true, stock: true },
      }),
    ]);

    const totalSales = ordersLastSevenDays.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    return {
      stats: [
        {
          label: "Productos",
          value: String(productCount),
          helper: "Inventario total",
          icon: "products",
          href: "/admin/productos",
        },
        {
          label: "Categorias",
          value: String(categoryCount),
          helper: "Vitrinas activas",
          icon: "categories",
          href: "/admin/categorias",
        },
        {
          label: "Pedidos",
          value: String(orderCount),
          helper: `${pendingOrderCount} pendientes`,
          icon: "orders",
          href: "/admin/pedidos",
        },
        {
          label: "Usuarios",
          value: String(userCount),
          helper: "Cuentas registradas",
          icon: "users",
          href: "/admin/usuarios",
        },
        {
          label: "Ventas 7 dias",
          value: formatCurrency(totalSales),
          helper: "Total reciente",
          icon: "sales",
          href: "/admin/pedidos",
        },
        {
          label: "Stock bajo",
          value: String(lowStockCount),
          helper: "Productos por revisar",
          icon: "warning",
          href: "/admin/productos",
        },
      ],
      orderData: buildOrderData(ordersLastSevenDays, sevenDaysAgo),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        number: order.number,
        customerName: order.customerName ?? "Cliente sin nombre",
        total: Number(order.total),
        status: order.status,
      })),
      lowStockProducts,
    };
  } catch {
    return {
      stats: [
        {
          label: "Productos",
          value: "0",
          helper: "Conecta PostgreSQL",
          icon: "products",
          href: "/admin/productos",
        },
        {
          label: "Categorias",
          value: "0",
          helper: "Sin datos",
          icon: "categories",
          href: "/admin/categorias",
        },
        {
          label: "Pedidos",
          value: "0",
          helper: "Sin datos",
          icon: "orders",
          href: "/admin/pedidos",
        },
        {
          label: "Usuarios",
          value: "0",
          helper: "Sin datos",
          icon: "users",
          href: "/admin/usuarios",
        },
      ],
      orderData: buildOrderData([], sevenDaysAgo),
      recentOrders: [],
      lowStockProducts: [],
    };
  }
}

function buildOrderData(
  orders: { createdAt: Date; total: unknown }[],
  startDate: Date,
) {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(startDate, -index);
    const key = format(date, "yyyy-MM-dd");
    const ordersForDay = orders.filter(
      (order) => format(order.createdAt, "yyyy-MM-dd") === key,
    );

    return {
      day: format(date, "EEE", { locale: es }),
      pedidos: ordersForDay.length,
      ventas: ordersForDay.reduce((sum, order) => sum + Number(order.total), 0),
    };
  });
}
