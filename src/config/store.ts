/**
 * Datos de la tienda en un solo lugar.
 *
 * Los campos de texto (envios, cambios, pagos, historia, redes) se muestran en
 * la tienda solo cuando tienen contenido: asi no se publican promesas que el
 * negocio no ha definido (regla: no inventar informacion).
 */

const FALLBACK_WHATSAPP = "573018757804";

function resolveWhatsappNumber() {
  const fromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return fromEnv && fromEnv.length >= 8 ? fromEnv : FALLBACK_WHATSAPP;
}

type StoreConfig = {
  name: string;
  whatsappNumber: string;
  heroImage: string;
  /** Ej.: "Envios a toda Colombia, 2 a 5 dias habiles". */
  shippingInfo: string;
  /** Ej.: "Cambios por talla dentro de 5 dias con la etiqueta puesta". */
  returnsInfo: string;
  /** Ej.: "Nequi, Bancolombia o PSE". Usa los medios que tus clientas ya conocen. */
  paymentInfo: string;
  /** Historia de la tienda: quien eres, de donde salen las prendas, que te hace distinta. */
  about: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  /**
   * Tabla de tallas propia. Completa `columns` (ej. ["Talla", "Busto", "Cintura",
   * "Cadera"]) y `rows` (ej. [["S", "84 cm", "64 cm", "90 cm"]]). Si queda vacia
   * solo se muestra como medirse y el contacto por WhatsApp.
   */
  sizeGuide: { columns: string[]; rows: string[][] };
  /**
   * Descuento por combinar: accesorios y belleza con `percent`% menos cuando el
   * pedido incluye una prenda. Es una condicion real y visible (nada de
   * temporizadores ni precios inflados). Apagalo con `enabled: false`.
   * Importante: solo activalo si vas a respetarlo en el pedido por WhatsApp.
   */
  bundleOffer: { enabled: boolean; percent: number };
};

export const STORE: StoreConfig = {
  name: "Moda Selecta",
  whatsappNumber: resolveWhatsappNumber(),
  // Reemplazar por una foto propia (idealmente vertical, +1200px de ancho).
  heroImage:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
  shippingInfo: "",
  returnsInfo: "",
  paymentInfo: "",
  about: "",
  instagramUrl: "",
  facebookUrl: "",
  tiktokUrl: "",
  sizeGuide: { columns: [], rows: [] },
  bundleOffer: { enabled: true, percent: 10 },
};

export function buildStoreWhatsappUrl(message: string) {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
