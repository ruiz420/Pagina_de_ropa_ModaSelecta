/**
 * Medicion de eventos clave (ver docs/metricas.md).
 *
 * Hoy no envia datos a ningun servicio: emite un evento del navegador
 * ("moda:track") y, si existe, reenvia a Google Analytics (gtag) o Plausible.
 * Asi, conectar una herramienta de analitica es agregar su script, sin tocar
 * los componentes. No recoge datos personales.
 */
export type TrackEventName =
  | "view_product"
  | "open_quick_add"
  | "add_to_cart"
  | "toggle_favorite"
  | "search"
  | "search_result_click"
  | "apply_filters"
  | "share_product"
  | "ask_whatsapp"
  | "open_size_guide"
  | "send_order_whatsapp"
  | "bundle_offer_shown"
  | "bundle_offer_add"
  | "clear_personalization";

type TrackProps = Record<string, string | number | boolean | undefined>;

type AnalyticsWindow = Window & {
  gtag?: (command: string, event: string, props?: TrackProps) => void;
  plausible?: (event: string, options?: { props?: TrackProps }) => void;
};

export function track(event: TrackEventName, props: TrackProps = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;

  window.dispatchEvent(
    new CustomEvent("moda:track", { detail: { event, props, at: Date.now() } }),
  );
  analyticsWindow.gtag?.("event", event, props);
  analyticsWindow.plausible?.(event, { props });

  if (process.env.NODE_ENV === "development") {
    console.debug("[track]", event, props);
  }
}
