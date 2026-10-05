"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSwatchColor } from "@/features/catalog/lib/color-swatches";

/** Muestras de color: botones visibles en vez de una lista desplegable. */
export function ColorSwatches({
  colors,
  value,
  onChange,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Color" className="flex flex-wrap gap-2.5">
      {colors.map((color) => {
        const swatch = getSwatchColor(color);
        const selected = value === color;

        // Si no reconocemos el color, mostramos el nombre como boton de texto.
        if (!swatch) {
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(color)}
              className={cn(
                "h-10 rounded-full border px-4 text-sm transition-colors",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-input bg-background hover:border-foreground/60",
              )}
            >
              {color}
            </button>
          );
        }

        return (
          <button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color}
            title={color}
            onClick={() => onChange(color)}
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-105",
              selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
            )}
            style={{ backgroundColor: swatch }}
          >
            {selected ? (
              <Check
                className={cn(
                  "h-4 w-4",
                  isLight(swatch) ? "text-foreground" : "text-white",
                )}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Tallas como botones en cuadricula: mas visibles que un desplegable. */
export function SizeButtons({
  sizes,
  value,
  onChange,
}: {
  sizes: string[];
  value: string;
  onChange: (size: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Talla" className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const selected = value === size;

        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(size)}
            className={cn(
              "h-11 min-w-12 rounded-lg border px-3.5 text-sm font-medium transition-colors",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-input bg-background hover:border-foreground/60",
            )}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}

function isLight(hex: string) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}
