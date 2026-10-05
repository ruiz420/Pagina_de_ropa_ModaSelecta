import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Agrega un tiempo maximo de conexion corto si la URL no lo trae (por defecto Prisma espera mucho). */
function datasourceUrl() {
  const url = process.env.DATABASE_URL;

  if (!url || url.includes("connect_timeout")) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=2`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: datasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
