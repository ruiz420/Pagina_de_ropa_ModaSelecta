import { STORE } from "@/config/store";
import { cn } from "@/lib/utils";

/**
 * El nombre de la tienda en letra cursiva de marca. Es el unico lugar donde se
 * aplica ese estilo: para cambiar la tipografia basta con tocar `--font-brand`
 * en globals.css (y la fuente en layout.tsx).
 */
export function BrandName({ className }: { className?: string }) {
  return (
    <span className={cn("font-brand font-normal leading-none", className)}>
      {STORE.name}
    </span>
  );
}
