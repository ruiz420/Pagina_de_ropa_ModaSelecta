const MIN_LENGTH = 32;
const KNOWN_PLACEHOLDER = /replace-with|change-me|development-secret|example/i;

/**
 * Secreto con el que se firman las sesiones. Si fuera conocido, cualquiera
 * podria fabricar una sesion de administrador, asi que en produccion se exige
 * un valor propio, largo y que no sea un texto de ejemplo. Solo en desarrollo
 * se tolera un valor de respaldo.
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (secret && secret.length >= MIN_LENGTH && !KNOWN_PLACEHOLDER.test(secret)) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXTAUTH_SECRET falta, es muy corto (minimo 32 caracteres) o es un texto de ejemplo. " +
        "Genera uno con: node -e \"console.log(require('crypto').randomBytes(48).toString('base64'))\"",
    );
  }

  return "development-secret";
}
