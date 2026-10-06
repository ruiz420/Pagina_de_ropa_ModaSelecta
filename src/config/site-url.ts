const LOCAL = /localhost|127\.0\.0\.1/;

/**
 * Direccion publica de la tienda (para sitemap, robots y enlaces absolutos).
 *
 * Orden: NEXTAUTH_URL si es una direccion real; si no, el dominio de produccion
 * que Vercel expone solo; si no, el de la publicacion actual; y como ultimo
 * recurso la local. Asi un NEXTAUTH_URL olvidado, o copiado de tu equipo
 * (localhost), nunca publica direcciones locales en internet.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXTAUTH_URL?.replace(/\/$/, "");

  if (explicit && !LOCAL.test(explicit)) {
    return explicit;
  }

  const productionDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (productionDomain) {
    return `https://${productionDomain}`;
  }

  const deploymentDomain = process.env.VERCEL_URL;

  if (deploymentDomain) {
    return `https://${deploymentDomain}`;
  }

  return explicit ?? "http://localhost:3000";
}
