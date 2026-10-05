"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Heart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE } from "@/config/store";

type MenuLink = { href: string; label: string };
type MenuCategory = { name: string; slug: string };

/** Menu de celular: antes el boton no hacia nada y no habia como navegar. */
export function MobileMenu({
  categories,
  links,
}: {
  categories: MenuCategory[];
  links: MenuLink[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="-ml-2 md:hidden"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[100] md:hidden">
              <button
                type="button"
                aria-label="Cerrar menu"
                className="absolute inset-0 animate-in bg-foreground/40 backdrop-blur-[2px] duration-200 fade-in"
                onClick={close}
              />
              <aside
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-in flex-col bg-background shadow-lift duration-300 slide-in-from-left"
              >
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <span className="font-display text-2xl font-medium">
                    {STORE.name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-mr-2"
                    aria-label="Cerrar menu"
                    onClick={close}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <nav className="flex-1 overflow-y-auto px-5 py-4">
                  <ul className="divide-y">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="flex items-center justify-between py-4 text-lg font-medium"
                        >
                          {link.label}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/nosotros"
                        onClick={close}
                        className="flex items-center justify-between py-4 text-lg font-medium"
                      >
                        Sobre la tienda
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/favoritos"
                        onClick={close}
                        className="flex items-center justify-between py-4 text-lg font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Mis favoritos
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  </ul>

                  {categories.length ? (
                    <div className="mt-6">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Categorias
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/catalogo?category=${category.slug}`}
                            onClick={close}
                            className="rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:border-foreground/50"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </nav>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
