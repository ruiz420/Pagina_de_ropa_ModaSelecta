import { CreditCard, MessageCircle, RefreshCw, Store, Truck } from "lucide-react";
import Link from "next/link";
import { STORE } from "@/config/store";

/**
 * Bloque de confianza. Solo afirma lo que es cierto del negocio; envios y
 * cambios aparecen unicamente cuando se completan en src/config/store.ts.
 */
export function ProductTrust() {
  const points = [
    {
      icon: Store,
      title: `Vendido por ${STORE.name}`,
      text: "Atencion directa de la tienda.",
      href: "/nosotros",
    },
    {
      icon: MessageCircle,
      title: "Pedido por WhatsApp",
      text: "Confirmamos talla, color y disponibilidad antes de que pagues.",
    },
    STORE.shippingInfo
      ? { icon: Truck, title: "Envios", text: STORE.shippingInfo }
      : null,
    STORE.returnsInfo
      ? { icon: RefreshCw, title: "Cambios", text: STORE.returnsInfo }
      : null,
    STORE.paymentInfo
      ? { icon: CreditCard, title: "Medios de pago", text: STORE.paymentInfo }
      : null,
  ].filter((point) => point !== null);

  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {points.map((point) => {
        const Icon = point.icon;
        const content = (
          <>
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-strong" />
            <div>
              <p className="text-sm font-medium">{point.title}</p>
              <p className="text-sm text-muted-foreground">{point.text}</p>
            </div>
          </>
        );

        return (
          <li key={point.title}>
            {"href" in point && point.href ? (
              <Link
                href={point.href}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/60"
              >
                {content}
              </Link>
            ) : (
              <div className="flex items-start gap-3 p-4">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
