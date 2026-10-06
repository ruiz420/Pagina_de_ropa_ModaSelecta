# Base de datos con Supabase

La tienda usa PostgreSQL con Prisma. Supabase ofrece PostgreSQL gestionado (plan
gratuito disponible) y funciona sin cambios en el código.

## 1. Crear el proyecto (lo haces tú, en tu cuenta)

1. Entra a https://supabase.com y crea una cuenta o inicia sesión.
2. **New project**: elige un nombre (por ejemplo `moda-selecta`), una
   **contraseña de base de datos larga y aleatoria** (guárdala en un gestor de
   contraseñas) y la región **East US (North Virginia)**. Medido desde Colombia
   responde en ~90 ms, frente a ~133 ms de EE. UU. oeste y ~156 ms de São Paulo:
   el tráfico desde Colombia sale por EE. UU., así que São Paulo no es la más
   cercana en la práctica.
3. Espera a que el proyecto termine de crearse.

## 2. Copiar la cadena de conexión

1. En el proyecto, pulsa **Connect** (arriba) y busca la cadena **Session
   pooler** (puerto 5432). Esa es compatible con IPv4, que es lo que usa la
   mayoría de redes en casa.
2. Reemplaza `[YOUR-PASSWORD]` por tu contraseña. Si tiene caracteres como `@`,
   `#`, `/`, `:` o `%`, hay que codificarlos (`@` → `%40`, `#` → `%23`,
   `/` → `%2F`, `:` → `%3A`, `%` → `%25`); lo más simple es una contraseña solo
   con letras y números.
3. Pégala en tu archivo **`.env`** (no en el chat ni en el repositorio):

```
DATABASE_URL="postgresql://postgres.xxxx:TU_CLAVE@aws-0-REGION.pooler.supabase.com:5432/postgres"
```

Con Session pooler no hace falta `DIRECT_URL`.

## 3. Crear las tablas y los datos iniciales

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

El seed crea los roles, el administrador (`ADMIN_EMAIL` / `ADMIN_PASSWORD` de tu
`.env`) y productos de ejemplo.

## 4. Cerrar la API pública de Supabase (obligatorio)

Supabase publica las tablas del esquema `public` mediante una API REST que
cualquiera con la clave pública del proyecto puede llamar, y las tablas creadas
con Prisma no traen la protección RLS activada. Sin este paso, tus tablas
(incluida la de usuarios) serían legibles y editables desde internet.

1. En Supabase abre **SQL Editor** → **New query**.
2. Pega el contenido de [`prisma/supabase-seguridad.sql`](../prisma/supabase-seguridad.sql)
   y pulsa **Run**.
3. La última consulta debe mostrar `rowsecurity = true` en todas las tablas.

La tienda no usa esa API (se conecta directo con Prisma), así que nada se rompe.

## 5. Reiniciar la tienda

Detén y vuelve a iniciar `npm start` (o `npm run dev`). Si la base responde, la
tienda mostrará tus productos reales en lugar del catálogo de ejemplo.

## Notas

- **Plan gratuito:** Supabase pausa los proyectos tras una semana sin actividad;
  se reactivan desde el panel.
- **Si cambias la contraseña de la base,** actualiza `DATABASE_URL`.
- **Contraseña del administrador:** si ya existía un administrador antes,
  `npm run admin:password` aplica la contraseña de `.env`.
- **Imágenes de productos:** las fotos que subas desde el panel se guardan en
  `public/uploads` (disco local). Para publicar la tienda en internet conviene
  usar un almacenamiento externo (por ejemplo Supabase Storage).
