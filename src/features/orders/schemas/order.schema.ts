import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  reference: z.string(),
  color: z.string().optional(),
  size: z.string().optional(),
  quantity: z.coerce.number().int().positive(),
  unitPrice: z.coerce.number().positive(),
});

export const orderSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerPhone: z.string().optional(),
  customerCity: z.string().optional(),
  whatsappUrl: z.string().url().optional(),
  items: z.array(orderItemSchema).min(1),
});

export type OrderInput = z.infer<typeof orderSchema>;
