-- Seguridad para Supabase. Ejecutar UNA VEZ en Supabase > SQL Editor,
-- despues de `npm run db:push`.
--
-- Supabase publica por defecto las tablas del esquema "public" mediante una API
-- REST que cualquiera con la clave publica (anon) del proyecto puede llamar.
-- Las tablas creadas con Prisma NO traen la proteccion RLS activada, asi que sin
-- este script esas tablas (incluida la de usuarios con sus contrasenas cifradas)
-- quedarian legibles y editables desde internet.
--
-- La tienda no usa esa API: se conecta directo a la base con Prisma, y ese rol
-- (postgres) no se ve afectado por RLS. Por eso es seguro cerrarla del todo.

DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- Quita permisos a los roles de la API publica, tambien para tablas futuras.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

-- Verificacion: todas las filas deben mostrar rowsecurity = true.
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
