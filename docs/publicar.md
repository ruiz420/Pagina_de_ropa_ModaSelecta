# Publicar la tienda

Guía para llevar la tienda de tu equipo a internet. Requiere tener ya la base de
datos en Supabase ([base-de-datos.md](base-de-datos.md)).

## 0. Antes de publicar

- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER` con tu número real (indicativo de país, sin
      signos, por ejemplo `573001234567`). Si queda como ejemplo, la tienda usa
      un número de respaldo escrito en el código.
- [ ] `src/config/store.ts`: envíos, cambios, medios de pago, historia, tabla de
      tallas y redes. Lo que quede vacío no se muestra.
- [ ] Decide si mantienes el 10% por combinar (`bundleOffer` en el mismo archivo).
- [ ] Fotos propias para el inicio y los productos.
- [ ] Política de tratamiento de datos y términos de compra.

## 1. Fotos en Supabase Storage

En hosting en la nube el disco es de solo lectura, así que las fotos que subas
desde el panel deben guardarse en Supabase Storage.

1. En Supabase: **Storage → New bucket**. Nombre `productos` y márcalo como
   **Public bucket** (las fotos de una tienda son públicas).
2. **Project Settings → API**: copia la **Project URL** y la clave
   **service_role** (es secreta: da acceso total al proyecto; no la compartas ni
   la pegues en el chat).
3. En tu `.env` agrega:

```
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="la-clave-service-role"
SUPABASE_STORAGE_BUCKET="productos"
```

4. Reinicia la tienda, entra al panel y sube una foto a un producto: la URL
   guardada debe empezar por tu dirección de Supabase, no por `/uploads/`.

Sin esas variables, la subida usa el disco local (sirve en tu equipo o en un
servidor propio, no en Vercel).

## 2. Hosting

El plan gratuito de Vercel **no permite uso comercial**; una tienda necesita el
plan Pro. Alternativa: un servidor Node (Railway, Render, un VPS) donde corre
`npm start` igual que en tu equipo.

## 3. Variables de entorno en el hosting

Se pegan en el panel del hosting (nunca en el repositorio):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Supabase → Connect → **Transaction pooler** (puerto 6543). Debe terminar en `?pgbouncer=true` |
| `DIRECT_URL` | Supabase → Connect → **Session pooler** (puerto 5432) |
| `NEXTAUTH_SECRET` | Uno **nuevo** para producción (comando en `.env.example`) |
| `NEXTAUTH_URL` | La dirección pública de la tienda, por ejemplo `https://tutienda.com` |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` | Del paso 1 |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Tu número real |

`ADMIN_EMAIL` y `ADMIN_PASSWORD` solo hacen falta en tu equipo para el seed;
no los subas al hosting.

## 4. Publicar en Vercel

1. Entra a vercel.com con tu cuenta de GitHub y elige **Add New → Project**.
2. Importa el repositorio `Pagina_de_ropa_ModaSelecta` (Next.js se detecta solo).
3. Pega las variables del paso 3 y pulsa **Deploy**.
4. Cada vez que subas cambios a la rama `main`, se publica automáticamente.

## 5. Después de publicar

- [ ] Abre la dirección pública y recorre la tienda en tu celular.
- [ ] Entra a `/login`, crea un producto con foto y confirma que aparece (las
      páginas se actualizan solas cada 5 minutos).
- [ ] Envía un pedido de prueba por WhatsApp y revisa el mensaje.
- [ ] Si conectas un dominio propio, actualiza `NEXTAUTH_URL`.
- [ ] Revisa en Supabase que las copias de seguridad estén activas.
- [ ] Conecta una herramienta de analítica (ver [metricas.md](metricas.md)).
