import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { orderSchema } from "@/features/orders/schemas/order.schema";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = orderSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const total = parsed.data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      number: `PED-${Date.now()}`,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerCity: parsed.data.customerCity,
      whatsappUrl: parsed.data.whatsappUrl,
      total,
      items: {
        create: parsed.data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          reference: item.reference,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
