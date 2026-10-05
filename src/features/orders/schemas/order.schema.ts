import { z } from "zod";

export const MAX_ITEMS_PER_ORDER = 30;
export const MAX_QUANTITY_PER_ITEM = 20;

/**
 * El navegador solo indica QUE quiere (producto, cantidad, talla, color).
 * Precio, nombre y referencia los pone el servidor desde la base de datos:
 * por eso aqui no existen. Cualquier campo extra se descarta.
 */
export const orderItemSchema = z.object({
  productId: z.string().min(1).max(64),
  color: z.string().max(40).optional(),
  size: z.string().max(40).optional(),
  quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
});

export const orderSchema = z.object({
  customerName: z.string().trim().min(2).max(80).optional(),
  customerPhone: z.string().trim().max(30).optional(),
  customerCity: z.string().trim().max(60).optional(),
  items: z.array(orderItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
