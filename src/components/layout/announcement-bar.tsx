import { STORE } from "@/config/store";

/** Franja superior: solo comunica lo que el negocio realmente ofrece. */
export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
        {STORE.shippingInfo ||
          "Haz tu pedido por WhatsApp: confirmamos talla y disponibilidad contigo"}
      </p>
    </div>
  );
}
