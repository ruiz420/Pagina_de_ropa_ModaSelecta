import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { HowItWorks } from "@/components/layout/how-it-works";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { BrandName } from "@/components/ui/brand-name";
import { Container } from "@/components/ui/container";
import { STORE, buildStoreWhatsappUrl } from "@/config/store";

export const metadata = {
  title: "Sobre la tienda",
  description: "Quienes somos, como comprar y como contactarnos.",
};

const policies = [
  { title: "Envíos", text: STORE.shippingInfo },
  { title: "Cambios", text: STORE.returnsInfo },
  { title: "Medios de pago", text: STORE.paymentInfo },
].filter((policy) => policy.text);

/** Perfil de la tienda: quien vende, como funciona y como contactar. */
export default function AboutPage() {
  const socials = [
    { label: "Instagram", href: STORE.instagramUrl },
    { label: "Facebook", href: STORE.facebookUrl },
    { label: "TikTok", href: STORE.tiktokUrl },
  ].filter((social) => social.href);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <div className="bg-brand-soft">
          <Container className="py-10 md:py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              Quiénes somos
            </p>
            <h1>
              <BrandName className="text-7xl md:text-9xl" />
            </h1>
          </Container>
        </div>

        <Container className="grid gap-10 py-12 md:grid-cols-[1.3fr_1fr] md:py-16">
          <div>
            <h2 className="font-display text-3xl font-medium tracking-tight">
              Nuestra historia
            </h2>
            <p className="mt-4 max-w-prose leading-7 text-foreground/80">
              {STORE.about ||
                "Seleccionamos prendas, accesorios y belleza para que armes tu look sin complicarte. Cada pedido lo atendemos directamente por WhatsApp, para que sepas exactamente qué recibes."}
            </p>
            {policies.length ? (
              <dl className="mt-8 space-y-5">
                {policies.map((policy) => (
                  <div key={policy.title}>
                    <dt className="font-semibold">{policy.title}</dt>
                    <dd className="mt-1 text-muted-foreground">{policy.text}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          <aside className="h-fit rounded-3xl border bg-card p-6">
            <h2 className="font-display text-2xl font-medium">¿Tienes preguntas?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Escríbenos y te ayudamos a elegir talla, color o a revisar
              disponibilidad.
            </p>
            <Button asChild variant="cta" size="lg" className="mt-5 w-full">
              <a
                href={buildStoreWhatsappUrl("Hola, quiero hacer una pregunta.")}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </a>
            </Button>
            {socials.length ? (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-brand-strong"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            ) : null}
            <Link
              href="/catalogo"
              className="mt-5 inline-block text-sm font-medium underline underline-offset-4 hover:text-brand-strong"
            >
              Ver la colección
            </Link>
          </aside>
        </Container>

        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  );
}
