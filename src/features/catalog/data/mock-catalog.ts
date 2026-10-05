export type CatalogProduct = {
  id: string;
  name: string;
  reference: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  colors: string[];
  sizes: string[];
  tags: string[];
  image: string;
  images: string[];
  badge?: string;
  description?: string;
  soldCount?: number;
};

export const categories = [
  { name: "Bodies", slug: "bodies", count: 42 },
  { name: "Blusas", slug: "blusas", count: 68 },
  { name: "Jeans", slug: "jeans", count: 31 },
  { name: "Vestidos", slug: "vestidos", count: 24 },
  { name: "Accesorios", slug: "accesorios", count: 12 },
  { name: "Maquillaje", slug: "maquillaje", count: 10 },
];

export const catalogProducts: CatalogProduct[] = [
  {
    id: "1",
    name: "Body canalado",
    reference: "B100",
    slug: "body-canalado-b100",
    category: "Bodies",
    price: 42000,
    compareAtPrice: 52000,
    stock: 18,
    colors: ["Negro", "Blanco", "Arena"],
    sizes: ["S", "M", "L"],
    tags: ["basico", "nuevo"],
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "Nuevo",
  },
  {
    id: "2",
    name: "Blusa manga globo",
    reference: "BL30",
    slug: "blusa-manga-globo-bl30",
    category: "Blusas",
    price: 58000,
    stock: 9,
    colors: ["Blanco", "Azul"],
    sizes: ["S", "M"],
    tags: ["tendencia"],
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "3",
    name: "Jean recto premium",
    reference: "JN22",
    slug: "jean-recto-premium-jn22",
    category: "Jeans",
    price: 96000,
    stock: 4,
    colors: ["Azul"],
    sizes: ["6", "8", "10", "12"],
    tags: [],
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "4",
    name: "Vestido satin corto",
    reference: "VS14",
    slug: "vestido-satin-corto-vs14",
    category: "Vestidos",
    price: 87000,
    compareAtPrice: 99000,
    stock: 12,
    colors: ["Verde", "Negro"],
    sizes: ["S", "M", "L"],
    tags: ["promocion"],
    image:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "Promo",
  },
  {
    id: "5",
    name: "Collar dorado minimalista",
    reference: "AC10",
    slug: "collar-dorado-minimalista-ac10",
    category: "Accesorios",
    price: 28000,
    compareAtPrice: 36000,
    stock: 15,
    colors: ["Dorado"],
    sizes: ["Unica"],
    tags: ["accesorio", "venta-cruzada"],
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "Combo",
  },
  {
    id: "6",
    name: "Cinturon hebilla dorada",
    reference: "AC22",
    slug: "cinturon-hebilla-dorada-ac22",
    category: "Accesorios",
    price: 34000,
    stock: 8,
    colors: ["Negro", "Cafe"],
    sizes: ["Unica"],
    tags: ["accesorio", "look"],
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    id: "7",
    name: "Gloss rosa corona",
    reference: "MQ01",
    slug: "gloss-rosa-corona-mq01",
    category: "Maquillaje",
    price: 26000,
    compareAtPrice: 33000,
    stock: 20,
    colors: ["Rosa", "Nude"],
    sizes: ["Unica"],
    tags: ["gloss", "brillo"],
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
    ],
    badge: "Brilla",
  },
  {
    id: "8",
    name: "Rubor rosa satinado",
    reference: "MQ12",
    slug: "rubor-rosa-satinado-mq12",
    category: "Maquillaje",
    price: 39000,
    stock: 14,
    colors: ["Rosa"],
    sizes: ["Unica"],
    tags: ["maquillaje", "rostro"],
    image:
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
    ],
  },
];
