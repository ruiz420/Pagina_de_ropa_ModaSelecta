import { NextResponse } from "next/server";
import { getStaffSession } from "@/features/auth/require-staff";
import {
  getProductValidationMessage,
  productSchema,
} from "@/features/products/schemas/product.schema";
import { prisma } from "@/lib/prisma";

/**
 * Lista completa para el panel. Incluye costo y precio mayorista, por lo que
 * solo la ve el personal; la tienda publica lee el catalogo por su servicio.
 */
export async function GET() {
  if (!(await getStaffSession())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      include: { category: true, images: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[products] no se pudo leer la lista", error);
    return NextResponse.json(
      { message: "No se pudo consultar la base de datos." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await getStaffSession())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const payload = await request.json();
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
      const createdProduct = await tx.product.create({
        data: {
          name: data.name,
          reference: data.reference,
          slug: data.slug,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          cost: data.cost,
          stock: data.stock,
          status: data.status,
          tags: data.tags,
          metaTitle: data.metaTitle || `${data.name} Ref ${data.reference}`,
          metaDescription: data.metaDescription || data.description.slice(0, 160),
          categoryId: data.categoryId,
          subCategoryId: data.subCategoryId || undefined,
          images: {
            create: data.images.map((url, order) => ({
              url,
              order,
              alt: data.name,
            })),
          },
          inventory: {
            create: {
              quantity: data.stock,
            },
          },
        },
      });

      for (const variant of variantInputs) {
        await tx.variant.create({
          data: {
            product: { connect: { id: createdProduct.id } },
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

      return createdProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo crear el producto. Verifica que la referencia y el slug no existan.",
      },
      { status: 409 },
    );
  }
}

function buildVariantInputs(colors: string[], sizes: string[]) {
  const normalizedColors = colors.length ? colors : [undefined];
  const normalizedSizes = sizes.length ? sizes : [undefined];

  return normalizedColors.flatMap((color) =>
    normalizedSizes.map((size) => ({ color, size })),
  );
}
