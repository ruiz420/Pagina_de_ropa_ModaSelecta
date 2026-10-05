import { NextResponse } from "next/server";
import { RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.nativeEnum(RoleName).default(RoleName.CUSTOMER),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user.role === "ADMIN";
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = createUserSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revisa los datos del usuario.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const role = await prisma.role.findUnique({ where: { name: parsed.data.role } });

  if (!role) {
    return NextResponse.json(
      { message: "El rol seleccionado no existe." },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        phone: parsed.data.phone || null,
        city: parsed.data.city || null,
        roleId: role.id,
      },
      include: { role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo crear. Ese correo puede estar repetido." },
      { status: 409 },
    );
  }
}
