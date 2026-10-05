import { STORE } from "@/config/store";
import { Container } from "@/components/ui/container";

const steps = [
  {
    title: "Elige lo que te gusta",
    text: "Escoge talla y color y agrégalo a tu bolsa. Sin crear cuenta.",
  },
  {
    title: "Envía tu pedido por WhatsApp",
    text: "Te armamos el mensaje con tus productos y el total, listo para enviar.",
  },
  {
    title: "Confirmamos contigo",
    text: "Verificamos talla y disponibilidad, y acordamos envío y pago antes de que pagues.",
  },
];

/** Explica el proceso completo antes de pedir la compra: reduce la incertidumbre. */
export function HowItWorks() {
  return (
    <section className="bg-card py-14 md:py-20">
      <Container>
        <div className="mb-10 max-w-xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-strong">
            Compra sin sorpresas
          </p>
          <h2 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
            Así funciona
          </h2>
        </div>
        <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-3xl border bg-background p-6">
              <span className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-medium text-brand-foreground">
                {index + 1}
              </span>
              <p className="mt-5 text-lg font-semibold">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
        {STORE.paymentInfo || STORE.shippingInfo || STORE.returnsInfo ? (
          <dl className="mt-8 grid gap-4 text-sm md:grid-cols-3">
            {STORE.paymentInfo ? (
              <div>
                <dt className="font-semibold">Medios de pago</dt>
                <dd className="mt-1 text-muted-foreground">{STORE.paymentInfo}</dd>
              </div>
            ) : null}
            {STORE.shippingInfo ? (
              <div>
                <dt className="font-semibold">Envíos</dt>
                <dd className="mt-1 text-muted-foreground">{STORE.shippingInfo}</dd>
              </div>
            ) : null}
            {STORE.returnsInfo ? (
              <div>
                <dt className="font-semibold">Cambios</dt>
                <dd className="mt-1 text-muted-foreground">{STORE.returnsInfo}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </Container>
    </section>
  );
}
