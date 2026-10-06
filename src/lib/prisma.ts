import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/** Agrega a la URL un tiempo maximo de conexion corto (por defecto Prisma espera mucho) y, en la nube, una conexion por ejecucion. */
function datasourceUrl() {
  const url = process.env.DATABASE_URL;

  if (!url || url.includes("connect_timeout")) {
    return url;
  }

  const params = ["connect_timeout=4"];

  // En hosting sin estado (Vercel) cada ejecucion debe usar una sola conexion
  // para no agotar las del pooler.
  if (process.env.VERCEL && !url.includes("connection_limit")) {
    params.push("connection_limit=1");
  }

  return `${url}${url.includes("?") ? "&" : "?"}${params.join("&")}`;
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
