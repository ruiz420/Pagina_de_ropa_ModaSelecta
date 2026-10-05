"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { getSwatchColor } from "@/features/catalog/lib/color-swatches";

type FilterValues = {
  search?: string;
  category?: string;
  collection?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  offer?: boolean;
  sort?: string;
};

type FilterOptions = {
  categories: { name: string; slug: string }[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
};

/**
 * Cajon de filtros. La talla va primero (es lo que mas condiciona la compra) y
 * todo son botones o muestras de color, no listas desplegables.
 */
export function FilterDrawer({
  values,
  options,
  activeCount,
  formatPrice,
}: {
  values: FilterValues;
  options: FilterOptions;
  activeCount: number;
  formatPrice: { min: string; max: string };
}) {
  const router = useRouter();
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of data.entries()) {
      const text = String(value).trim();

      // "recent" es el orden por defecto: no hace falta ensuciar la URL.
      if (text && !(key === "sort" && text === "recent")) {
        params.set(key, text);
      }
    }

    const query = params.toString();
    track("apply_filters", { filters: [...params.keys()].join(",") });
    router.push(query ? `/catalogo?${query}` : "/catalogo");
    setOpen(false);
  }

  const label = activeCount ? `Filtrar · ${activeCount}` : "Filtrar";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="hidden gap-2 rounded-full md:inline-flex"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
      </Button>

      {/* En celular el boton flota abajo, al alcance del pulgar. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 z-40 flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lift transition-transform active:scale-95 md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        {label}
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[100]">
              <button
                type="button"
                aria-label="Cerrar filtros"
                className="absolute inset-0 animate-in bg-foreground/40 backdrop-blur-[2px] duration-200 fade-in"
                onClick={() => setOpen(false)}
              />
              <form
                onSubmit={handleSubmit}
                role="dialog"
                aria-modal="true"
                aria-label="Filtros"
                className="absolute inset-y-0 right-0 flex w-full max-w-md animate-in flex-col bg-background shadow-lift duration-300 slide-in-from-right"
              >
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <h2 className="font-display text-2xl font-medium">Filtrar</h2>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="-mr-2"
                    aria-label="Cerrar filtros"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
                  <input type="hidden" name="sort" value={values.sort ?? ""} />
                  <input
                    type="hidden"
                    name="collection"
                    value={values.collection ?? ""}
                  />

                  <Section title="Talla">
                    <div className="flex flex-wrap gap-2">
                      <Choice name="size" value="" defaultChecked={!values.size}>
                        Todas
                      </Choice>
                      {options.sizes.map((size) => (
                        <Choice
                          key={size}
                          name="size"
                          value={size}
                          defaultChecked={values.size === size}
                        >
                          {size}
                        </Choice>
                      ))}
                    </div>
                  </Section>

                  <Section title="Color">
                    <div className="flex flex-wrap gap-2.5">
                      <Choice name="color" value="" defaultChecked={!values.color}>
                        Todos
                      </Choice>
                      {options.colors.map((color) => {
                        const swatch = getSwatchColor(color);

                        return swatch ? (
                          <Swatch
                            key={color}
                            color={color}
                            swatch={swatch}
                            defaultChecked={values.color === color}
                          />
                        ) : (
                          <Choice
                            key={color}
                            name="color"
                            value={color}
                            defaultChecked={values.color === color}
                          >
                            {color}
                          </Choice>
                        );
                      })}
                    </div>
                  </Section>

                  <Section title="Categoria">
                    <div className="flex flex-wrap gap-2">
                      <Choice
                        name="category"
                        value=""
                        defaultChecked={!values.category}
                      >
                        Todas
                      </Choice>
                      {options.categories.map((category) => (
                        <Choice
                          key={category.slug}
                          name="category"
                          value={category.slug}
                          defaultChecked={values.category === category.slug}
                        >
                          {category.name}
                        </Choice>
                      ))}
                    </div>
                  </Section>

                  <Section title="Precio">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        name="minPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder={`Desde ${formatPrice.min}`}
                        defaultValue={values.minPrice}
                        aria-label="Precio minimo"
                      />
                      <Input
                        name="maxPrice"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder={`Hasta ${formatPrice.max}`}
                        defaultValue={values.maxPrice}
                        aria-label="Precio maximo"
                      />
                    </div>
                  </Section>

                  <label className="flex cursor-pointer items-center justify-between rounded-xl border bg-card p-4">
                    <span className="text-sm font-medium">Solo ofertas</span>
                    <input
                      type="checkbox"
                      name="offer"
                      value="true"
                      defaultChecked={values.offer}
                      className="h-5 w-5 accent-brand"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-3 border-t bg-background px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                  <Button
                    asChild
                    variant="ghost"
                    className="underline underline-offset-4"
                    onClick={() => setOpen(false)}
                  >
                    <Link href="/catalogo">Limpiar</Link>
                  </Button>
                  <Button type="submit" variant="cta" size="lg">
                    Ver resultados
                  </Button>
                </div>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

function Choice({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="flex h-11 min-w-12 items-center justify-center rounded-lg border border-input bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/60 peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        {children}
      </span>
    </label>
  );
}

function Swatch({
  color,
  swatch,
  defaultChecked,
}: {
  color: string;
  swatch: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="cursor-pointer" title={color}>
      <input
        type="radio"
        name="color"
        value={color}
        defaultChecked={defaultChecked}
        className="peer sr-only"
        aria-label={color}
      />
      <span
        className={cn(
          "block h-11 w-11 rounded-full border border-black/10 transition-transform hover:scale-105",
          "peer-checked:ring-2 peer-checked:ring-foreground peer-checked:ring-offset-2 peer-checked:ring-offset-background peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
        )}
        style={{ backgroundColor: swatch }}
      />
    </label>
  );
}
