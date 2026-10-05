import { NextResponse } from "next/server";
import { ProductStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/features/auth/auth-options";
import {
  getProductValidationMessage,
  productSchema,
} from "@/features/products/schemas/product.schema";
import { prisma } from "@/lib/prisma";

const updateProductSchema = z.object({
  status: z.nativeEnum(ProductStatus).optional(),
});

async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  return ["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
  const statusOnly = updateProductSchema.safeParse(payload);
  const { id } = await params;

  if (statusOnly.success && Object.keys(payload).length === 1) {
    const product = await prisma.product.update({
      where: { id },
      data: statusOnly.data,
    });

    return NextResponse.json(product);
  }

  const parsed = productSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: getProductValidationMessage(parsed.error),
        issues: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const variantInputs = buildVariantInputs(data.colors, data.sizes);

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          reference: data.reference,
          slug: data.slug,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice ?? null,
          cost: data.cost ?? null,
          stock: data.stock,
          status: data.status,
          tags: data.tags,
          metaTitle: data.metaTitle || `${data.name} Ref ${data.reference}`,
          metaDescription: data.metaDescription || data.description.slice(0, 160),
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: data.images.map((url, order) => ({
          productId: id,
          url,
          order,
          alt: data.name,
        })),
      });

      await tx.variant.deleteMany({ where: { productId: id } });
      for (const variant of variantInputs) {
        await tx.variant.create({
          data: {
            product: { connect: { id } },
            stock: data.stock,
            color: variant.color
              ? {
                  connectOrCreate: {
                    where: { name: variant.color },
                    create: { name: variant.color },
                  },
                }
              : undefined,
            size: variant.size
              ? {
                  connectOrCreate: {
                    where: { name: variant.size },
                    create: { name: variant.size },
                  },
                }
              : undefined,
          },
        });
      }

      await tx.inventory.upsert({
        where: { productId: id },
        update: { quantity: data.stock },
        create: { productId: id, quantity: data.stock },
      });

      return updatedProduct;
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo actualizar el producto. Verifica que la referencia y el slug no existan.",
      },
      { status: 409 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo eliminar. Si ya tuvo pedidos, cambia el estado a Oculto o Agotado.",
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}

function buildVariantInputs(colors: string[], sizes: string[]) {
  const normalizedColors = colors.length ? colors : [undefined];
  const normalizedSizes = sizes.length ? sizes : [undefined];

  return normalizedColors.flatMap((color) =>
    normalizedSizes.map((size) => ({ color, size })),
  );
}
