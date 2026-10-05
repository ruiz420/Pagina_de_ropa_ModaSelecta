import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { LayoutDashboard, Package, Shapes, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/features/auth/auth-options";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Shapes },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  if (!["ADMIN", "EMPLOYEE"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <Link href="/" className="text-sm text-muted-foreground">
              Inicio
            </Link>
            <h1 className="text-lg font-semibold">Panel administrativo</h1>
          </div>
          <Button asChild>
            <Link href="/admin/productos">Gestionar inventario</Link>
          </Button>
        </div>
      </div>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border bg-card p-3">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </aside>
        <section>{children}</section>
      </main>
    </div>
  );
}
