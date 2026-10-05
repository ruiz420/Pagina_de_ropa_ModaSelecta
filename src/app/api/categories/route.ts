import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth-options";
import { categorySchema } from "@/features/categories/schemas/category.schema";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = categorySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          "Revisa los campos de la categoria. La imagen debe ser una URL publica valida.",
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.create({
      data: parsed.data,
    });

    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "No se pudo crear la categoria. Verifica que no exista." },
      { status: 409 },
    );
  }
}
