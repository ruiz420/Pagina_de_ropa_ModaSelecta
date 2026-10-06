import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { BrandName } from "@/components/ui/brand-name";
import { Container } from "@/components/ui/container";
import { STORE, buildStoreWhatsappUrl } from "@/config/store";

const footerLinks = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/catalogo?offer=true", label: "Ofertas" },
  { href: "/accesorios", label: "Accesorios" },
  { href: "/maquillaje", label: "Belleza" },
  { href: "/favoritos", label: "Favoritos" },
  { href: "/nosotros", label: "Nosotros" },
];

/** Pie compacto: marca, enlaces y contacto en pocas lineas para no restarle espacio a los productos. */
export function SiteFooter() {
  const socials = [
    { label: "Instagram", href: STORE.instagramUrl },
    { label: "Facebook", href: STORE.facebookUrl },
    { label: "TikTok", href: STORE.tiktokUrl },
  ].filter((social) => social.href);
  // Datos opcionales de la tienda: solo aparecen si estan completos en la configuracion.
  const notes = [
    STORE.shippingInfo && `Envios: ${STORE.shippingInfo}`,
    STORE.returnsInfo && `Cambios: ${STORE.returnsInfo}`,
    STORE.paymentInfo && `Pagos: ${STORE.paymentInfo}`,
  ].filter(Boolean);

  return (
    <footer className="mt-12 border-t bg-card">
      <Container className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex items-center justify-between gap-4 md:justify-start md:gap-6">
          <BrandName className="text-3xl" />
          <a
            href={buildStoreWhatsappUrl("Hola, tengo una pregunta sobre un producto.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
        <nav
          aria-label="Enlaces del pie de pagina"
          className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-foreground/80"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </Container>
      <div className="border-t">
        <Container className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-xs text-muted-foreground">
          <span>
            © {new Date().getFullYear()} {STORE.name}
          </span>
          {notes.map((note) => (
            <span key={String(note)}>{note}</span>
          ))}
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {social.label}
            </a>
          ))}
        </Container>
      </div>
    </footer>
  );
}
