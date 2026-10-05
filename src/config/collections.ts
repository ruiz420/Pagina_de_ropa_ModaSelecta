/**
 * Colecciones: formas de explorar por estilo u ocasion, no solo por tipo de prenda.
 *
 * Funcionan con las etiquetas (tags) de cada producto: para que una coleccion
 * aparezca en la tienda, basta con etiquetar productos con su `tag` en el panel
 * (por ejemplo "oficina" o "segunda mano"). Las colecciones sin productos no
 * se muestran.
 */
export type CollectionDefinition = {
  slug: string;
  label: string;
  /** Etiqueta del producto que activa la coleccion (se compara sin tildes ni mayusculas). */
  tag: string;
  blurb: string;
};

export const COLLECTIONS: CollectionDefinition[] = [
  { slug: "tendencia", label: "Tendencia", tag: "tendencia", blurb: "Lo que se esta llevando." },
  { slug: "nuevo", label: "Lo nuevo", tag: "nuevo", blurb: "Piezas recien llegadas." },
  { slug: "basicos", label: "Basicos", tag: "basico", blurb: "Los que combinan con todo." },
  { slug: "oficina", label: "Oficina", tag: "oficina", blurb: "Looks para el trabajo." },
  { slug: "casual", label: "Casual", tag: "casual", blurb: "Comodos para el dia a dia." },
  { slug: "vintage", label: "Vintage", tag: "vintage", blurb: "Piezas con historia." },
  { slug: "lujo", label: "Lujo", tag: "lujo", blurb: "Prendas premium." },
  {
    slug: "segunda-mano",
    label: "Segunda mano",
    tag: "segunda mano",
    blurb: "Prendas con una segunda vida.",
  },
];

export function getCollection(slug?: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}
