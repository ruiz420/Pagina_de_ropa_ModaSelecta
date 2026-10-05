import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { prisma } from "@/lib/prisma";

const colorSchema = z.object({
  name: z.string().min(2),
  hex: z.string().optional(),
});

export async function GET() {
  const colors = await prisma.color.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(colors);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = colorSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Escribe un nombre de color valido." },
      { status: 400 },
    );
  }

  try {
    const color = await prisma.color.create({ data: parsed.data });
    return NextResponse.json(color, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Ese color ya existe." },
      { status: 409 },
    );
  }
}
