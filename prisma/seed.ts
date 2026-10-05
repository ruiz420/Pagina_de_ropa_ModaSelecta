import { PrismaClient, RoleName, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugifyText } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  const roles = await Promise.all(
    [RoleName.ADMIN, RoleName.EMPLOYEE, RoleName.CUSTOMER].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: {
          name,
          permissions:
            name === RoleName.ADMIN
              ? { all: true }
              : name === RoleName.EMPLOYEE
                ? { products: ["create", "read", "update"], inventory: ["read", "update"] }
                : { catalog: ["read"], cart: ["create"] },
        },
      }),
    ),
  );

  const adminRole = roles.find((role) => role.name === RoleName.ADMIN);
  if (!adminRole) {
    throw new Error("Admin role was not created");
  }

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: {},
    create: {
      name: "Administrador",
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "admin1234", 10),
      roleId: adminRole.id,
    },
  });

  const categoryPayload = [
    { name: "Bodies", description: "Prendas basicas y tendencia para mayoristas." },
    { name: "Blusas", description: "Blusas casuales, elegantes y de temporada." },
    { name: "Jeans", description: "Denim para rotacion constante." },
    { name: "Vestidos", description: "Vestidos cortos y largos para inventario propio." },
    { name: "Accesorios", description: "Complementos de baja rotacion para venta cruzada." },
    { name: "Maquillaje", description: "Belleza y cosmeticos con vitrina llamativa." },
  ];

  const categories = await Promise.all(
    categoryPayload.map((category, index) =>
      prisma.category.upsert({
        where: { slug: slugifyText(category.name) },
        update: {},
        create: {
          name: category.name,
          slug: slugifyText(category.name),
          description: category.description,
          order: index,
        },
      }),
    ),
  );

  const products = [
    {
      name: "Body canalado",
      reference: "B100",
      categoryName: "Bodies",
      description: "Body canalado de alta rotacion para ventas al por mayor.",
      price: 42000,
      compareAtPrice: 52000,
      wholesalePrice: 36000,
      stock: 18,
      colors: ["Negro", "Blanco", "Arena"],
      sizes: ["S", "M", "L"],
      image:
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
      tags: ["basico", "nuevo"],
    },
    {
      name: "Blusa manga globo",
      reference: "BL30",
      categoryName: "Blusas",
      description: "Blusa femenina con manga globo y fit comercial.",
      price: 58000,
      wholesalePrice: 49000,
      stock: 9,
      colors: ["Blanco", "Azul"],
      sizes: ["S", "M"],
      image:
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      tags: ["tendencia"],
    },
    {
      name: "Jean recto premium",
      reference: "JN22",
      categoryName: "Jeans",
      description: "Jean recto en denim premium para compartir por WhatsApp.",
      price: 96000,
      stock: 4,
      colors: ["Azul"],
      sizes: ["6", "8", "10", "12"],
      image:
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      tags: ["poco-stock"],
    },
    {
      name: "Vestido satin corto",
      reference: "VS14",
      categoryName: "Vestidos",
      description: "Vestido satinado corto para colecciones de fiesta.",
      price: 87000,
      compareAtPrice: 99000,
      wholesalePrice: 76000,
      stock: 12,
      colors: ["Verde", "Negro"],
      sizes: ["S", "M", "L"],
      image:
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
      tags: ["promocion"],
    },
    {
      name: "Collar dorado minimalista",
      reference: "AC10",
      categoryName: "Accesorios",
      description: "Collar dorado ideal para completar looks y aumentar el valor del carrito.",
      price: 28000,
      compareAtPrice: 36000,
      stock: 15,
      colors: ["Dorado"],
      sizes: ["Unica"],
      image:
        "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
      tags: ["accesorio", "venta-cruzada"],
    },
    {
      name: "Cinturon hebilla dorada",
      reference: "AC22",
      categoryName: "Accesorios",
      description: "Cinturon combinable para recomendar junto con jeans, vestidos y bodies.",
      price: 34000,
      stock: 8,
      colors: ["Negro", "Cafe"],
      sizes: ["Unica"],
      image:
        "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80",
      tags: ["accesorio", "look"],
    },
    {
      name: "Gloss rosa corona",
      reference: "MQ01",
      categoryName: "Maquillaje",
      description: "Gloss rosa brillante para una vitrina de maquillaje llamativa.",
      price: 26000,
      compareAtPrice: 33000,
      stock: 20,
      colors: ["Rosa", "Nude"],
      sizes: ["Unica"],
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
      tags: ["gloss", "brillo", "maquillaje"],
    },
    {
      name: "Rubor rosa satinado",
      reference: "MQ12",
      categoryName: "Maquillaje",
      description: "Rubor rosa satinado para completar pedidos de belleza.",
      price: 39000,
      stock: 14,
      colors: ["Rosa"],
      sizes: ["Unica"],
      image:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=80",
      tags: ["maquillaje", "rostro"],
    },
  ];

  for (const product of products) {
    const category = categories.find((item) => item.name === product.categoryName);
    if (!category) {
      continue;
    }

    const savedProduct = await prisma.product.upsert({
      where: { reference: product.reference },
      update: {
        compareAtPrice: product.compareAtPrice,
      },
      create: {
        name: product.name,
        reference: product.reference,
        slug: slugifyText(`${product.name}-${product.reference}`),
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        wholesalePrice: product.wholesalePrice,
        stock: product.stock,
        status: product.stock > 0 ? ProductStatus.ACTIVE : ProductStatus.OUT_OF_STOCK,
        tags: product.tags,
        categoryId: category.id,
        metaTitle: `${product.name} Ref ${product.reference}`,
        metaDescription: product.description,
        images: {
          create: {
            url: product.image,
            alt: product.name,
          },
        },
        inventory: {
          create: {
            quantity: product.stock,
          },
        },
      },
    });

    const existingVariants = await prisma.variant.count({
      where: { productId: savedProduct.id },
    });

    if (!existingVariants) {
      const variantInputs = product.colors.flatMap((color) =>
        product.sizes.map((size) => ({ color, size })),
      );

      for (const variant of variantInputs) {
        await prisma.variant.create({
          data: {
            product: { connect: { id: savedProduct.id } },
            stock: product.stock,
            color: {
              connectOrCreate: {
                where: { name: variant.color },
                create: { name: variant.color },
              },
            },
            size: {
              connectOrCreate: {
                where: { name: variant.size },
                create: { name: variant.size },
              },
            },
          },
        });
      }
    }
  }

  await prisma.settings.upsert({
    where: { id: "store-settings" },
    update: {},
    create: {
      id: "store-settings",
      storeName: "Inventario de Ropa",
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "57XXXXXXXXXX",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
