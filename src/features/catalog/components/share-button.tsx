"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

/** Comparte con el menu nativo del celular; si no existe, copia el enlace. */
export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    track("share_product", { product: title });

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // La persona cerro el menu de compartir: no es un error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2"
      onClick={handleShare}
    >
      <Share2 className="h-4 w-4" />
      Compartir
    </Button>
  );
}
