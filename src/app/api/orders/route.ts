import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { buildOrder, OrderError } from "@/features/orders/lib/build-order";
import { orderSchema } from "@/features/orders/schemas/order.schema";
import { prisma } from "@/lib/prisma";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

const ORDERS_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000;
const NUMBER_RETRIES = 3;

function newOrderNumber() {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PED-${time}-${random}`;
}

/**
 * Crea un pedido. Es publico (las clientas no tienen cuenta), por eso:
 * - limita cuantos pedidos puede crear una misma direccion;
 * - ignora cualquier precio o nombre que envie el navegador y los lee de la base de datos;
 * - aplica el mismo descuento por combinar que la bolsa.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`orders:${getClientKey(request)}`, {
    limit: ORDERS_PER_WINDOW,
    windowMs: WINDOW_MS,
  });

  if (!limit.ok) {
    return NextResponse.json(
      { message: "Demasiados pedidos seguidos. Intenta de nuevo en unos minutos." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Pedido invalido." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Revisa los datos del pedido.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { items, ...customer } = parsed.data;

  try {
    const rows = await prisma.product.findMany({
      where: { id: { in: [...new Set(items.map((item) => item.productId))] } },
      include: { category: true, variants: { include: { color: true, size: true } } },
    });

    const products = new Map(
      rows.map((row) => [
        row.id,
        {
          id: row.id,
          name: row.name,
          reference: row.reference,
          price: Number(row.price),
          stock: row.stock,
          isActive: row.status === "ACTIVE",
          category: row.category.name,
          colors: [...new Set(row.variants.flatMap((v) => (v.color ? [v.color.name] : [])))],
          sizes: [...new Set(row.variants.flatMap((v) => (v.size ? [v.size.name] : [])))],
        },
      ]),
    );

    const { lines, total, savings } = buildOrder(items, products);

    for (let attempt = 1; attempt <= NUMBER_RETRIES; attempt += 1) {
      try {
        const order = await prisma.order.create({
          data: {
            number: newOrderNumber(),
            customerName: customer.customerName,
            customerPhone: customer.customerPhone,
            customerCity: customer.customerCity,
            total,
            items: {
              create: lines.map((line) => ({
                productId: line.productId,
                name: line.name,
                reference: line.reference,
                color: line.color,
                size: line.size,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                total: line.total,
              })),
            },
          },
        });

        return NextResponse.json(
          { number: order.number, total, savings, status: order.status },
          { status: 201 },
        );
      } catch (error) {
        // Numero repetido (muy improbable): se reintenta con otro.
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";

        if (!isDuplicate || attempt === NUMBER_RETRIES) {
          throw error;
        }
      }
    }

    throw new Error("No se pudo generar el numero de pedido.");
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    console.error("[orders] no se pudo crear el pedido", error);
    return NextResponse.json(
      { message: "No pudimos registrar tu pedido ahora. Intenta de nuevo en un momento." },
      { status: 503 },
    );
  }
}
