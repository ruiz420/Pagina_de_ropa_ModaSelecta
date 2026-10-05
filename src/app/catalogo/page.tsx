import { X } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { getCollection } from "@/config/collections";
import { cn, formatCurrency } from "@/lib/utils";
import { FilterDrawer } from "@/features/catalog/components/filter-drawer";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { SortSelect } from "@/features/catalog/components/sort-select";
import {
  type CatalogFilters,
  type CatalogSort,
  getCatalogCollections,
  getCatalogFilterOptions,
  getCatalogProducts,
} from "@/features/catalog/services/catalog.service";

export const metadata = {
  title: "Catalogo",
  description: "Catalogo de productos con filtros por categoria, precio y talla.",
};

export const dynamic = "force-dynamic";

type FilterKey =
  | "search"
  | "category"
  | "collection"
  | "color"
  | "size"
  | "price"
  | "offer";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = getFiltersFromSearchParams(params);
  const [products, filterOptions, collections] = await Promise.all([
    getCatalogProducts(filters),
    getCatalogFilterOptions(),
    getCatalogCollections(),
  ]);
  const collectionLabel = getCollection(filters.collection)?.label;
  const categoryName = filterOptions.categories.find(
    (category) => category.slug === filters.category,
  )?.name;
  const hasPrice = filters.minPrice !== undefined || filters.maxPrice !== undefined;
  const activeChips: { key: FilterKey; label: string }[] = [
    filters.search ? { key: "search" as const, label: `"${filters.search}"` } : null,
    filters.category
      ? { key: "category" as const, label: categoryName ?? filters.category }
      : null,
    collectionLabel
      ? { key: "collection" as const, label: collectionLabel }
      : null,
    filters.size ? { key: "size" as const, label: `Talla ${filters.size}` } : null,
    filters.color ? { key: "color" as const, label: filters.color } : null,
    hasPrice
      ? {
          key: "price" as const,
          label: [
            filters.minPrice !== undefined
              ? `Desde ${formatCurrency(filters.minPrice)}`
              : null,
            filters.maxPrice !== undefined
              ? `Hasta ${formatCurrency(filters.maxPrice)}`
              : null,
          ]
            .filter(Boolean)
            .join(" "),
        }
      : null,
    filters.offer ? { key: "offer" as const, label: "Ofertas" } : null,
  ].filter((chip) => chip !== null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <div className="bg-brand-soft">
          <Container className="py-10 md:py-16">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-brand-strong">
              Coleccion
            </p>
            <h1 className="font-display text-5xl font-medium leading-none tracking-tight md:text-7xl">
              {collectionLabel ?? categoryName ?? "Catalogo"}
            </h1>
          </Container>
        </div>
        <Container className="pb-24 pt-8 md:pb-16 md:pt-10">

          <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <CategoryChip href="/catalogo" active={!filters.category}>
              Todo
            </CategoryChip>
            {filterOptions.categories.map((category) => (
              <CategoryChip
                key={category.slug}
                href={buildHref(filters, { category: category.slug })}
                active={filters.category === category.slug}
              >
                {category.name}
              </CategoryChip>
            ))}
          </div>

          {collections.length ? (
            <div className="scrollbar-none -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <span className="shrink-0 pr-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Por estilo
              </span>
              {collections.map((collection) => (
                <CategoryChip
                  key={collection.slug}
                  href={buildHref(filters, { collection: collection.slug })}
                  active={filters.collection === collection.slug}
                  subtle
                >
                  {collection.label}
                </CategoryChip>
              ))}
            </div>
          ) : null}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y py-3">
            <p className="text-sm text-muted-foreground">
              {products.length}{" "}
              {products.length === 1 ? "producto" : "productos"}
            </p>
            <div className="flex items-center gap-2">
              <SortSelect
                value={filters.sort ?? "recent"}
                currentParams={toParamRecord(filters, { omit: ["sort"] })}
              />
              <FilterDrawer
                values={filters}
                options={filterOptions}
                activeCount={activeChips.length}
                formatPrice={{
                  min: formatCurrency(filterOptions.minPrice),
                  max: formatCurrency(filterOptions.maxPrice),
                }}
              />
            </div>
          </div>

          {activeChips.length ? (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={hrefWithout(filters, chip.key)}
                  aria-label={`Quitar filtro ${chip.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-medium text-brand-strong transition-colors hover:bg-brand-soft/70"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5" />
                </Link>
              ))}
              <Link
                href="/catalogo"
                className="px-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Limpiar todo
              </Link>
            </div>
          ) : null}

          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border bg-card p-10 text-center">
              <p className="font-display text-2xl font-medium">
                No encontramos coincidencias
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Prueba quitando algun filtro o explora toda la coleccion.
              </p>
              <Button asChild variant="cta" className="mt-6">
                <Link href="/catalogo">Ver toda la coleccion</Link>
              </Button>
            </div>
          )}
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryChip({
  href,
  active,
  subtle = false,
  children,
}: {
  href: string;
  active: boolean;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "whitespace-nowrap rounded-full border text-sm font-medium transition-colors",
        subtle ? "px-4 py-2" : "px-5 py-2.5",
        active
          ? "border-foreground bg-foreground text-background"
          : "bg-card hover:border-foreground/50",
      )}
    >
      {children}
    </Link>
  );
}

/** Convierte los filtros en parametros de URL, omitiendo los indicados. */
function toParamRecord(
  filters: CatalogFilters,
  { omit = [] }: { omit?: (keyof CatalogFilters)[] } = {},
) {
  const entries: [string, string | undefined][] = [
    ["search", filters.search],
    ["category", filters.category],
    ["collection", filters.collection],
    ["color", filters.color],
    ["size", filters.size],
    ["minPrice", filters.minPrice?.toString()],
    ["maxPrice", filters.maxPrice?.toString()],
    ["offer", filters.offer ? "true" : undefined],
    ["sort", filters.sort && filters.sort !== "recent" ? filters.sort : undefined],
  ];

  return Object.fromEntries(
    entries.filter(
      (entry): entry is [string, string] =>
        Boolean(entry[1]) && !omit.includes(entry[0] as keyof CatalogFilters),
    ),
  );
}

function buildHref(filters: CatalogFilters, override: Partial<CatalogFilters>) {
  const query = new URLSearchParams(toParamRecord({ ...filters, ...override }));
  const text = query.toString();
  return text ? `/catalogo?${text}` : "/catalogo";
}

function hrefWithout(filters: CatalogFilters, key: FilterKey) {
  const next: CatalogFilters = { ...filters };

  if (key === "price") {
    next.minPrice = undefined;
    next.maxPrice = undefined;
  } else {
    next[key] = undefined;
  }

  return buildHref(next, {});
}

function getFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  return {
    search: getParam(params.search),
    category: getParam(params.category),
    collection: getCollection(getParam(params.collection))?.slug,
    color: getParam(params.color),
    size: getParam(params.size),
    minPrice: getNumberParam(params.minPrice),
    maxPrice: getNumberParam(params.maxPrice),
    offer: getBooleanParam(params.offer),
    sort: getSortParam(params.sort),
  };
}

function getParam(value: string | string[] | undefined) {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved?.trim() || undefined;
}

function getNumberParam(value: string | string[] | undefined) {
  const resolved = getParam(value);
  if (!resolved) {
    return undefined;
  }

  const number = Number(resolved);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
}

function getBooleanParam(value: string | string[] | undefined) {
  return getParam(value) === "true" ? true : undefined;
}

function getSortParam(value: string | string[] | undefined): CatalogSort {
  const resolved = getParam(value);

  return ["recent", "price-asc", "price-desc", "discount"].includes(
    resolved ?? "",
  )
    ? (resolved as CatalogSort)
    : "recent";
}
