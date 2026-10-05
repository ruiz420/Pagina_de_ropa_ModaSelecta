"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";

/** Cambia el orden al instante conservando los filtros activos. */
export function SortSelect({
  value,
  currentParams,
}: {
  value: string;
  currentParams: Record<string, string>;
}) {
  const router = useRouter();

  return (
    <Select
      aria-label="Ordenar por"
      value={value}
      className="w-auto rounded-full pr-8"
      onChange={(event) => {
        const params = new URLSearchParams(currentParams);
        params.set("sort", event.target.value);
        router.push(`/catalogo?${params.toString()}`);
      }}
    >
      <option value="recent">Mas recientes</option>
      <option value="price-asc">Menor precio</option>
      <option value="price-desc">Mayor precio</option>
      <option value="discount">Mayor descuento</option>
    </Select>
  );
}
