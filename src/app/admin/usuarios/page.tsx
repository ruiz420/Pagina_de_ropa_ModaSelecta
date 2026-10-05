import { RoleName, type Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/features/users/components/user-form";
import { UserRowActions } from "@/features/users/components/user-row-actions";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Usuarios",
};

export const dynamic = "force-dynamic";

type UserWithRole = Prisma.UserGetPayload<{
  include: { role: true; _count: { select: { orders: true } } };
}>;

export default async function AdminUsersPage() {
  let users: UserWithRole[] = [];
  let dbError = false;

  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not configured");
    }

    users = await prisma.user.findMany({
      include: {
        role: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  } catch {
    dbError = true;
  }

  const adminCount = users.filter((user) => user.role.name === RoleName.ADMIN).length;
  const employeeCount = users.filter(
    (user) => user.role.name === RoleName.EMPLOYEE,
  ).length;
  const customerCount = users.filter(
    (user) => user.role.name === RoleName.CUSTOMER,
  ).length;

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            Crea cuentas, revisa clientes y cambia permisos del equipo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Admins" value={adminCount} />
          <MetricCard label="Empleados" value={employeeCount} />
          <MetricCard label="Clientes" value={customerCount} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear usuario</CardTitle>
          </CardHeader>
          <CardContent>
            {dbError ? (
              <p className="text-sm text-muted-foreground">
                Conecta PostgreSQL para gestionar usuarios.
              </p>
            ) : (
              <UserForm />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios registrados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid gap-3 rounded-md border p-3 text-sm xl:grid-cols-[1.1fr_160px_120px_1.3fr]"
              >
                <div>
                  <p className="font-medium">{user.name ?? "Sin nombre"}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-muted-foreground">
                    {user.phone ?? "Sin telefono"} · {user.city ?? "Sin ciudad"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pedidos</p>
                  <p className="font-medium">{user._count.orders}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rol</p>
                  <Badge>{getRoleLabel(user.role.name)}</Badge>
                </div>
                <UserRowActions
                  user={{
                    id: user.id,
                    name: user.name ?? "",
                    phone: user.phone ?? "",
                    city: user.city ?? "",
                    role: user.role.name,
                  }}
                />
              </div>
            ))}
            {!users.length && !dbError ? (
              <p className="text-sm text-muted-foreground">
                Aun no hay usuarios registrados.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function getRoleLabel(role: RoleName) {
  switch (role) {
    case RoleName.ADMIN:
      return "Admin";
    case RoleName.EMPLOYEE:
      return "Empleado";
    case RoleName.CUSTOMER:
    default:
      return "Cliente";
  }
}
