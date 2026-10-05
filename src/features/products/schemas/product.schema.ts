import { z } from "zod";
import { slugifyText } from "@/lib/utils";

const optionalPositiveNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().positive().optional(),
);

const productImageSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string()
    .min(1)
    .refine(
      (value) =>
        isPublicImageUrl(value) ||
        value.startsWith("/uploads/") ||
        /^\/[\w\-./%]+\.(jpg|jpeg|png|webp|gif|svg)$/i.test(value),
      "La imagen debe ser una URL publica o una ruta interna de imagen.",
    ),
);

function isPublicImageUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export const productSchema = z.object({
  name: z.string().min(3),
  reference: z.string().min(2),
  price: z.coerce.number().positive(),
  compareAtPrice: optionalPositiveNumber,
  cost: optionalPositiveNumber,
  description: z.string().min(10),
  categoryId: z.string().min(1),
  subCategoryId: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  images: z.array(productImageSchema).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["ACTIVE", "HIDDEN", "OUT_OF_STOCK"]).default("ACTIVE"),
  slug: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
}).transform((value) => ({
  ...value,
  slug: value.slug || slugifyText(`${value.name}-${value.reference}`),
}));

export type ProductFormValues = z.input<typeof productSchema>;
export type ProductInput = z.output<typeof productSchema>;

export function getProductValidationMessage(error: z.ZodError) {
  const firstIssue = error.issues[0];

  if (!firstIssue) {
    return "Revisa los campos del producto.";
  }

  const field = firstIssue.path.join(".");

  if (field.startsWith("images")) {
    return "Revisa las imagenes. Usa archivos cargados desde la opcion de imagenes o URLs publicas.";
  }

  const fieldLabels: Record<string, string> = {
    name: "nombre",
    reference: "referencia",
    price: "precio de venta",
    compareAtPrice: "precio antes de oferta",
    cost: "precio de compra",
    description: "descripcion",
    categoryId: "categoria",
    stock: "stock",
    status: "estado",
  };

  return `Revisa el campo ${fieldLabels[field] ?? field}: ${firstIssue.message}`;
}
