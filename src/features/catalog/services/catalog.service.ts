import { cache } from "react";
import { COLLECTIONS, getCollection } from "@/config/collections";
import {
  getDiscountPercent,
  hasTag,
} from "@/features/catalog/lib/product-signals";
import { sortSizes } from "@/features/catalog/lib/size-order";
import { withDatabase } from "@/lib/db-guard";
import { prisma } from "@/lib/prisma";
import {
  catalogProducts as mockProducts,
  categories as mockCategories,
  type CatalogProduct,
} from "@/features/catalog/data/mock-catalog";

export type CatalogSort = "recent" | "price-asc" | "price-desc" | "discount";

export type CatalogFilters = {
  search?: string;
  category?: string;
  /** Slug de una coleccion (ver src/config/collections.ts). */
  collection?: string;
  color?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  offer?: boolean;
  sort?: CatalogSort;
};

export type CatalogCategory = {
  name: string;
  slug: string;
  count: number;
  imageUrl?: string;
};

export type CatalogFilterOptions = {
  categories: CatalogCategory[];
  colors: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
};

function toCatalogProduct(product: {
  id: string;
  name: string;
  reference: string;
  slug: string;
  price: unknown;
  compareAtPrice: unknown;
  stock: number;
  tags: string[];
  description: string;
  soldCount: number;
  category: { name: string };
  images: { url: string }[];
  variants: {
    color: { name: string } | null;
    size: { name: string } | null;
  }[];
}): CatalogProduct {
  const colors = Array.from(
    new Set(product.variants.map((variant) => variant.color?.name).filter(isString)),
  );
  const sizes = sortSizes(
    Array.from(
      new Set(product.variants.map((variant) => variant.size?.name).filter(isString)),
    ),
  );

  return {
    id: product.id,
    name: product.name,
    reference: product.reference,
    slug: product.slug,
    category: product.category.name,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice
      ? Number(product.compareAtPrice)
      : undefined,
    stock: product.stock,
    colors,
    sizes,
    tags: product.tags,
    description: product.description || undefined,
    soldCount: product.soldCount,
    image: product.images[0]?.url ?? "/window.svg",
    images: product.images.length
      ? product.images.map((image) => image.url)
      : ["/window.svg"],
    badge: undefined,
  };
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}

/** Aplica los filtros que se resuelven en memoria: coleccion (por etiqueta) y orden por descuento. */
function applyInMemoryRules(products: CatalogProduct[], filters: CatalogFilters) {
  const collection = getCollection(filters.collection);
  const filtered = collection
    ? products.filter((product) => hasTag(product, collection.tag))
    : products;

  if (filters.sort !== "discount") {
    return filtered;
  }

  return [...filtered].sort(
    (a, b) => (getDiscountPercent(b) ?? 0) - (getDiscountPercent(a) ?? 0),
  );
}

/**
 * `cache` de React recuerda el resultado durante una misma visita: la cabecera,
 * la pagina y cada seccion piden el catalogo y la base se consulta una sola vez.
 * La clave es el JSON de los filtros porque los objetos nuevos nunca coinciden.
 */
const fetchCatalogProductsOnce = cache((filtersKey: string) =>
  fetchCatalogProducts(JSON.parse(filtersKey) as CatalogFilters),
);

export async function getCatalogProducts(
  filters: CatalogFilters = {},
): Promise<CatalogProduct[]> {
  return applyInMemoryRules(
    await fetchCatalogProductsOnce(JSON.stringify(filters)),
    filters,
  );
}

async function fetchCatalogProducts(
  filters: CatalogFilters = {},
): Promise<CatalogProduct[]> {
  return withDatabase(async () => {
    const products = await prisma.product.findMany({
      // Una sola consulta con JOIN: con la base remota evita ~6 viajes seguidos.
      relationLoadStrategy: "join",
      where: {
        status: "ACTIVE",
        category: filters.category ? { slug: filters.category } : undefined,
        price: {
          gte: filters.minPrice,
          lte: filters.maxPrice,
        },
        compareAtPrice: filters.offer ? { not: null } : undefined,
        variants:
          filters.color || filters.size
            ? {
                some: {
                  color: filters.color ? { name: filters.color } : undefined,
                  size: filters.size ? { name: filters.size } : undefined,
                },
              }
            : undefined,
        OR: filters.search
          ? [
              { name: { contains: filters.search, mode: "insensitive" } },
              { reference: { contains: filters.search, mode: "insensitive" } },
              { tags: { has: filters.search } },
            ]
          : undefined,
      },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: {
          include: { color: true, size: true },
        },
      },
      orderBy: getProductOrderBy(filters.sort),
      take: 48,
    });

    const catalogProducts = products.map(toCatalogProduct);
    const filteredProducts = filters.offer
      ? catalogProducts.filter(
          (product) =>
            Boolean(product.compareAtPrice) &&
            Number(product.compareAtPrice) > product.price,
        )
      : catalogProducts;

    return filteredProducts.length || hasCatalogFilters(filters)
      ? filteredProducts
      : mockProducts;
  }, () => filterMockProducts(mockProducts, filters));
}

function hasCatalogFilters(filters: CatalogFilters) {
  return Boolean(
    filters.search ||
      filters.category ||
      filters.color ||
      filters.size ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.offer,
  );
}

export type CatalogCollection = {
  slug: string;
  label: string;
  blurb: string;
  count: number;
};

/** Colecciones que realmente tienen productos (segun las etiquetas cargadas). */
export async function getCatalogCollections(): Promise<CatalogCollection[]> {
  const products = await getCatalogProducts();

  return COLLECTIONS.map((collection) => ({
    slug: collection.slug,
    label: collection.label,
    blurb: collection.blurb,
    count: products.filter((product) => hasTag(product, collection.tag)).length,
  })).filter((collection) => collection.count > 0);
}

export async function getCatalogAccessoryProducts(
  limit = 4,
): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts();

  return products
    .filter((product) => isAccessoryCategory(product.category))
    .slice(0, limit);
}

export async function getCatalogMakeupProducts(): Promise<CatalogProduct[]> {
  const products = await getCatalogProducts();

  return products.filter((product) => isMakeupCategory(product.category));
}

function isAccessoryCategory(category: string) {
  const normalized = category.toLowerCase();
  return normalized.includes("accesorio") || normalized.includes("accessory");
}

function isMakeupCategory(category: string) {
  const normalized = category.toLowerCase();
  return (
    normalized.includes("maquillaje") ||
    normalized.includes("makeup") ||
    normalized.includes("belleza")
  );
}

export const getCatalogCategories = cache(async (): Promise<CatalogCategory[]> => {
  return withDatabase(async () => {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
    });

    return categories.length
      ? categories.map((category) => ({
          name: category.name,
          slug: category.slug,
          count: category._count.products,
          imageUrl: category.imageUrl ?? undefined,
        }))
      : mockCategories;
  }, () => mockCategories);
});

export async function getCatalogFilterOptions(): Promise<CatalogFilterOptions> {
  const [products, categories] = await Promise.all([
    getCatalogProducts(),
    getCatalogCategories(),
  ]);

  return buildFilterOptions(products, categories);
}

export const getCatalogProductBySlug = cache(async (slug: string) => {
  const fromMock = () => mockProducts.find((item) => item.slug === slug);

  return withDatabase(async () => {
    const product = await prisma.product.findUnique({
      relationLoadStrategy: "join",
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { order: "asc" } },
        variants: {
          include: { color: true, size: true },
        },
      },
    });

    return product ? toCatalogProduct(product) : fromMock();
  }, fromMock);
});

function getProductOrderBy(sort: CatalogSort = "recent") {
  switch (sort) {
    case "price-asc":
      return { price: "asc" as const };
    case "price-desc":
      return { price: "desc" as const };
    case "recent":
    default:
      return { createdAt: "desc" as const };
  }
}

function filterMockProducts(
  products: CatalogProduct[],
  filters: CatalogFilters,
) {
  const search = filters.search?.toLowerCase().trim();

  return products
    .filter((product) => {
      const matchesSearch = search
        ? [
            product.name,
            product.reference,
            product.category,
            ...product.tags,
          ].some((value) => value.toLowerCase().includes(search))
        : true;
      const matchesCategory = filters.category
        ? product.category.toLowerCase() === filters.category
        : true;
      const matchesColor = filters.color
        ? product.colors.includes(filters.color)
        : true;
      const matchesSize = filters.size ? product.sizes.includes(filters.size) : true;
      const matchesMin = filters.minPrice ? product.price >= filters.minPrice : true;
      const matchesMax = filters.maxPrice ? product.price <= filters.maxPrice : true;
      const matchesOffer = filters.offer
        ? Boolean(product.compareAtPrice) &&
          Number(product.compareAtPrice) > product.price
        : true;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesColor &&
        matchesSize &&
        matchesMin &&
        matchesMax &&
        matchesOffer
      );
    })
    .sort((a, b) => {
      switch (filters.sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "recent":
        default:
          return 0;
      }
    });
}

function buildFilterOptions(
  products: CatalogProduct[],
  categories: CatalogCategory[],
): CatalogFilterOptions {
  const prices = products.map((product) => product.price);

  return {
    categories,
    colors: Array.from(new Set(products.flatMap((product) => product.colors))).sort(),
    sizes: sortSizes(Array.from(new Set(products.flatMap((product) => product.sizes)))),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}
