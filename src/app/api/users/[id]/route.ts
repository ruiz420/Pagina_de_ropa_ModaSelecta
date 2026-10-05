import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.nativeEnum(RoleName).optional(),
  password: z.string().min(6).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "ADMIN" ? session : null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = updateUserSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revisa los datos del usuario.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id } = await params;
  const role = parsed.data.role
    ? await prisma.role.findUnique({ where: { name: parsed.data.role } })
    : null;

  if (parsed.data.role && !role) {
    return NextResponse.json(
      { message: "El rol seleccionado no existe." },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      city: parsed.data.city,
      roleId: role?.id,
      passwordHash: parsed.data.password
        ? await bcrypt.hash(parsed.data.password, 10)
        : undefined,
    },
    include: { role: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdmin();

  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (session.user.id === id) {
    return NextResponse.json(
      { message: "No puedes eliminar tu propio usuario." },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      { message: "No se pudo eliminar. Este usuario puede tener pedidos." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
