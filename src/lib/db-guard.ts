/**
 * Proteccion contra una base de datos caida o lenta.
 *
 * Sin esto, cada pagina espera el tiempo maximo de conexion de Prisma (unos
 * 8 segundos) antes de usar el catalogo de ejemplo, y los clics parecen no
 * hacer nada. Aqui la consulta se corta a los pocos segundos y, mientras la
 * base siga sin responder, las siguientes visitas saltan directo al respaldo.
 */

const QUERY_TIMEOUT_MS = 2_500;
const COOLDOWN_MS = 60_000;

let unavailableUntil = 0;

export function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL) && Date.now() >= unavailableUntil;
}

function withTimeout<T>(promise: Promise<T>) {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("La base de datos tardo demasiado en responder.")),
      QUERY_TIMEOUT_MS,
    );
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/** Ejecuta la consulta; si la base no responde, devuelve el respaldo sin hacer esperar. */
export async function withDatabase<T>(
  query: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (!isDatabaseAvailable()) {
    return fallback();
  }

  try {
    return await withTimeout(query());
  } catch (error) {
    if (Date.now() >= unavailableUntil) {
      console.warn(
        `[db] Base de datos no disponible; se usa el respaldo por ${COOLDOWN_MS / 1000} s.`,
        error instanceof Error ? error.message.split("\n").pop() : "",
      );
    }

    unavailableUntil = Date.now() + COOLDOWN_MS;
    return fallback();
  }
}
