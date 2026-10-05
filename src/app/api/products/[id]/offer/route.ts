import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import { prisma } from "@/lib/prisma";

const offerSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("percent"),
    discountPercent: z.coerce.number().min(1).max(90),
  }),
  z.object({
    mode: z.literal("manual"),
    price: z.coerce.number().positive(),
    compareAtPrice: z.coerce.number().positive(),
  }),
  z.object({
    mode: z.literal("clear"),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const parsed = offerSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de oferta invalidos." },
      { status: 400 },
    );
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json(
      { message: "Producto no encontrado." },
      { status: 404 },
    );
  }

  if (parsed.data.mode === "clear") {
    const compareAtPrice = product.compareAtPrice
      ? Number(product.compareAtPrice)
      : null;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        price: compareAtPrice ?? product.price,
        compareAtPrice: null,
      },
    });

    return NextResponse.json(updatedProduct);
  }

  if (parsed.data.mode === "percent") {
    const originalPrice = product.compareAtPrice
      ? Number(product.compareAtPrice)
      : Number(product.price);
    const salePrice = Math.round(
      originalPrice * (1 - parsed.data.discountPercent / 100),
    );

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        price: salePrice,
        compareAtPrice: originalPrice,
      },
    });

    return NextResponse.json(updatedProduct);
  }

  if (parsed.data.compareAtPrice <= parsed.data.price) {
    return NextResponse.json(
      { message: "El precio anterior debe ser mayor al precio de oferta." },
      { status: 400 },
    );
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
    },
  });

  return NextResponse.json(updatedProduct);
}
