/**
 * Limite de peticiones por cliente, en memoria.
 *
 * Frena el abuso basico (alguien creando pedidos sin parar). Limitacion: el
 * conteo vive en este proceso; si el sitio corre en varias instancias o en
 * hosting sin estado, cada una cuenta por separado y conviene un limite en la
 * plataforma o en un almacen compartido.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000),
    };
  }

  recent.push(now);
  hits.set(key, recent);

  // Limpieza ocasional para que el mapa no crezca sin limite.
  if (hits.size > 5_000) {
    for (const [storedKey, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) {
        hits.delete(storedKey);
      }
    }
  }

  return { ok: true as const };
}

/** IP del cliente segun los encabezados del proxy (o "local" si no hay). */
export function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
