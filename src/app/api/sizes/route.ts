import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { prisma } from "@/lib/prisma";

const sizeSchema = z.object({
  name: z.string().min(1),
  order: z.coerce.number().int().min(0).default(0),
});

export async function GET() {
  const sizes = await prisma.size.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(sizes);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = sizeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Escribe una talla valida." },
      { status: 400 },
    );
  }

  try {
    const size = await prisma.size.create({ data: parsed.data });
    return NextResponse.json(size, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Esa talla ya existe." },
      { status: 409 },
    );
  }
}
