"use client";

import { MessageCircle, Ruler, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { STORE, buildStoreWhatsappUrl } from "@/config/store";
import { track } from "@/lib/analytics";

const HOW_TO_MEASURE = [
  { part: "Busto", how: "Rodea la parte mas ancha del pecho, sin apretar la cinta." },
  { part: "Cintura", how: "Mide la parte mas estrecha del torso, sobre el ombligo." },
  { part: "Cadera", how: "Rodea la parte mas ancha de la cadera, con los pies juntos." },
];

/**
 * Guia de tallas. La tabla sale de src/config/store.ts (la completa la tienda);
 * si no existe, no se inventan medidas: se explica como medirse y se ofrece
 * ayuda por WhatsApp.
 */
export function SizeGuideButton({ productName }: { productName: string }) {
  const [open, setOpen] = useState(false);
  const { columns, rows } = STORE.sizeGuide;
  const hasTable = columns.length > 0 && rows.length > 0;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track("open_size_guide", { product: productName });
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 transition-colors hover:text-brand-strong"
      >
        <Ruler className="h-4 w-4" />
        Guia de tallas
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} label="Guia de tallas">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-medium">Guia de tallas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Elegir bien la talla evita cambios y devoluciones.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2"
            aria-label="Cerrar guia de tallas"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {hasTable ? (
          <div className="mt-5 overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="px-3 py-2.5 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.join("|")}>
                    {row.map((cell, index) => (
                      <td
                        key={`${cell}-${index}`}
                        className={index === 0 ? "px-3 py-2.5 font-medium" : "px-3 py-2.5"}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="mb-3 mt-5 text-sm font-semibold">Como medirte</p>
        <ul className="space-y-3">
          {HOW_TO_MEASURE.map((item) => (
            <li key={item.part} className="text-sm">
              <span className="font-medium">{item.part}: </span>
              <span className="text-muted-foreground">{item.how}</span>
            </li>
          ))}
        </ul>

        {!hasTable ? (
          <p className="mt-4 rounded-xl bg-brand-soft p-3 text-sm text-brand-strong">
            Las medidas exactas de cada prenda te las confirmamos por WhatsApp
            antes de que pagues.
          </p>
        ) : null}

        <Button asChild variant="cta" size="lg" className="mt-5 w-full">
          <a
            href={buildStoreWhatsappUrl(
              `Hola, necesito ayuda con mi talla para ${productName}.`,
            )}
            target="_blank"
            rel="noreferrer"
            onClick={() => track("ask_whatsapp", { topic: "talla", product: productName })}
          >
            <MessageCircle className="h-5 w-5" />
            Ayudame con mi talla
          </a>
        </Button>
      </Sheet>
    </>
  );
}
