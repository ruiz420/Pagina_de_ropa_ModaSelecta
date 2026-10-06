import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_BUCKET = "productos";

let client: SupabaseClient | null | undefined;

/**
 * Cliente de Supabase Storage (solo servidor). Usa la clave de servicio, que
 * NUNCA debe llegar al navegador: por eso no lleva el prefijo NEXT_PUBLIC_.
 * Devuelve null si no esta configurado (en desarrollo se guarda en disco).
 */
function getClient() {
  if (client !== undefined) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  client = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return client;
}

export function isStorageConfigured() {
  return getClient() !== null;
}

/** Sube un archivo al bucket publico y devuelve su URL publica. */
export async function uploadPublicFile(path: string, bytes: Uint8Array, contentType: string) {
  const supabase = getClient();

  if (!supabase) {
    throw new Error("Supabase Storage no esta configurado.");
  }

  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? DEFAULT_BUCKET;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType, upsert: false, cacheControl: "31536000" });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
