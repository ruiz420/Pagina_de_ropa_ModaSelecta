import { z } from "zod";
import { slugifyText } from "@/lib/utils";

const optionalUrl = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.string().url().optional(),
);

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: optionalUrl,
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
}).transform((value) => ({
  ...value,
  slug: value.slug || slugifyText(value.name),
}));

export type CategoryFormValues = z.input<typeof categorySchema>;
export type CategoryInput = z.output<typeof categorySchema>;
