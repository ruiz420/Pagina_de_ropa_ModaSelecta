"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { formatCurrency, slugifyText } from "@/lib/utils";

export type SearchItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  category: string;
  reference: string;
  tags: string[];
};

const MAX_RESULTS = 5;

/**
 * Busqueda con resultados en vivo: quien sabe lo que busca llega al producto
 * sin pasar por el catalogo. Solo usa los productos reales de la tienda.
 */
export function HeaderSearch({
  items,
  suggestions,
}: {
  items: SearchItem[];
  suggestions: string[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmed = query.trim();
  const results = useMemo(() => {
    const tokens = slugifyText(trimmed).split("-").filter(Boolean);

    if (!tokens.length) {
      return [];
    }

    return items.filter((item) => {
      const haystack = slugifyText(
        [item.name, item.category, item.reference, ...item.tags].join(" "),
      );
      return tokens.every((token) => haystack.includes(token));
    });
  }, [items, trimmed]);

  function close() {
    setIsOpen(false);
    setQuery("");
  }

  function goTo(search: string) {
    const text = search.trim();

    if (text) {
      track("search", { query: text, results: results.length });
      router.push(`/catalogo?search=${encodeURIComponent(text)}`);
    }

    close();
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goTo(query);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Buscar"
        onClick={() => setIsOpen(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100]">
          <button
            type="button"
            aria-label="Cerrar busqueda"
            className="absolute inset-0 animate-in bg-foreground/40 backdrop-blur-[2px] duration-200 fade-in"
            onClick={close}
          />
          <div className="absolute inset-x-0 top-0 max-h-[100dvh] animate-in overflow-y-auto bg-background px-4 pb-6 pt-4 shadow-lift duration-200 slide-in-from-top-4 sm:px-6">
            <form
              onSubmit={submitSearch}
              className="mx-auto flex max-w-2xl items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Busca prendas, accesorios, maquillaje..."
                  className="h-12 rounded-full pl-11"
                  aria-label="Buscar producto"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Cerrar busqueda"
                onClick={close}
              >
                <X className="h-5 w-5" />
              </Button>
            </form>

            <div className="mx-auto mt-4 max-w-2xl">
              {trimmed ? (
                results.length ? (
                  <>
                    <ul className="divide-y rounded-2xl border bg-card">
                      {results.slice(0, MAX_RESULTS).map((item) => (
                        <li key={item.id}>
                          <Link
                            href={`/producto/${item.slug}`}
                            onClick={() => {
                              track("search_result_click", {
                                query: trimmed,
                                product: item.name,
                              });
                              close();
                            }}
                            className="flex items-center gap-3 p-3 transition-colors hover:bg-muted/60"
                          >
                            <span className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={item.image}
                                alt=""
                                fill
                                sizes="44px"
                                className="object-cover"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                {item.category}
                              </span>
                              <span className="block truncate font-medium">
                                {item.name}
                              </span>
                            </span>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(item.price)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => goTo(query)}
                      className="mt-3 text-sm font-medium underline underline-offset-4 hover:text-brand-strong"
                    >
                      Ver los {results.length}{" "}
                      {results.length === 1 ? "resultado" : "resultados"} para
                      &ldquo;{trimmed}&rdquo;
                    </button>
                  </>
                ) : (
                  <div className="rounded-2xl border bg-card p-5 text-sm">
                    <p className="font-medium">
                      No encontramos &ldquo;{trimmed}&rdquo;
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      Prueba con otra palabra o explora una categoria.
                    </p>
                  </div>
                )
              ) : null}

              {!trimmed || !results.length ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Explora:
                  </span>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => goTo(suggestion)}
                      className="rounded-full border bg-card px-3.5 py-1.5 text-sm transition-colors hover:border-foreground/50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
