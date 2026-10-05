import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { STORE, buildStoreWhatsappUrl } from "@/config/store";

const shopLinks = [
  { href: "/catalogo", label: "Todo el catalogo" },
  { href: "/catalogo?offer=true", label: "Ofertas" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/maquillaje", label: "Belleza" },
  { href: "/favoritos", label: "Mis favoritos" },
  { href: "/nosotros", label: "Sobre la tienda" },
];

export function SiteFooter() {
  const socials = [
    { label: "Instagram", href: STORE.instagramUrl },
    { label: "Facebook", href: STORE.facebookUrl },
    { label: "TikTok", href: STORE.tiktokUrl },
  ].filter((social) => social.href);

  return (
    <footer className="mt-16 border-t bg-card">
      <Container className="grid gap-10 py-12 text-sm md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <p className="font-display text-2xl font-medium">{STORE.name}</p>
          <p className="mt-3 max-w-sm leading-6 text-muted-foreground">
            Prendas, accesorios y belleza seleccionados para que estrenes con
            estilo. Eliges en la tienda y cerramos tu pedido por WhatsApp.
          </p>
          {socials.length ? (
            <div className="mt-4 flex gap-4">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-foreground underline-offset-4 hover:underline"
                >
                  {social.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Comprar
          </p>
          <ul className="mt-4 space-y-2.5">
            {shopLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-foreground/80 transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Ayuda
          </p>
          <ul className="mt-4 space-y-3 leading-6 text-foreground/80">
            <li>
              <a
                href={buildStoreWhatsappUrl(
                  "Hola, tengo una pregunta sobre un producto.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-medium text-foreground hover:underline"
              >
                <MessageCircle className="h-4 w-4" />
                Escribenos por WhatsApp
              </a>
            </li>
            <li>Confirmamos talla y disponibilidad antes de que pagues.</li>
            {STORE.shippingInfo ? <li>Envios: {STORE.shippingInfo}</li> : null}
            {STORE.returnsInfo ? <li>Cambios: {STORE.returnsInfo}</li> : null}
          </ul>
        </div>
      </Container>
      <div className="border-t">
        <Container className="py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {STORE.name}. Todos los derechos reservados.
        </Container>
      </div>
    </footer>
  );
}
