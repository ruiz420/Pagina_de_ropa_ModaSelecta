import { priceCart } from "@/features/cart/lib/pricing";
import type { OrderItemInput } from "@/features/orders/schemas/order.schema";

/** Datos del producto tal como estan en la base de datos (la unica fuente de verdad). */
export type OrderProduct = {
  id: string;
  name: string;
  reference: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: string;
  colors: string[];
  sizes: string[];
};

export type OrderLine = {
  productId: string;
  name: string;
  reference: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

/** Error con mensaje seguro para mostrar y el codigo HTTP que le corresponde. */
export class OrderError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404 | 409,
  ) {
    super(message);
  }
}

/**
 * Arma el pedido con precios del servidor. Aplica la misma regla de descuento
 * que la bolsa (priceCart), asi el total que ve la clienta y el que se guarda
 * siempre coinciden y nadie puede ponerse un precio.
 */
export function buildOrder(
  items: OrderItemInput[],
  products: Map<string, OrderProduct>,
) {
  const requestedByProduct = new Map<string, number>();

  for (const item of items) {
    const product = products.get(item.productId);

    if (!product || !product.isActive) {
      throw new OrderError(
        "Uno de los productos ya no esta disponible. Revisa tu bolsa.",
        404,
      );
    }

    if (item.color && product.colors.length && !product.colors.includes(item.color)) {
      throw new OrderError(`El color elegido no existe para ${product.name}.`, 400);
    }

    if (item.size && product.sizes.length && !product.sizes.includes(item.size)) {
      throw new OrderError(`La talla elegida no existe para ${product.name}.`, 400);
    }

    requestedByProduct.set(
      product.id,
      (requestedByProduct.get(product.id) ?? 0) + item.quantity,
    );
  }

  for (const [productId, requested] of requestedByProduct) {
    const product = products.get(productId);

    if (product && requested > product.stock) {
      throw new OrderError(
        product.stock > 0
          ? `Solo quedan ${product.stock} unidades de ${product.name}.`
          : `${product.name} esta agotado.`,
        409,
      );
    }
  }

  const priced = priceCart(
    items.map((item) => {
      const product = products.get(item.productId)!;

      return {
        productId: product.id,
        name: product.name,
        reference: product.reference,
        slug: "",
        category: product.category,
        price: product.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      };
    }),
  );

  const lines: OrderLine[] = priced.lines.map(({ item, unitPrice, lineTotal }) => ({
    productId: item.productId,
    name: item.name,
    reference: item.reference,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    unitPrice,
    total: lineTotal,
  }));

  return { lines, total: priced.total, savings: priced.savings };
}
