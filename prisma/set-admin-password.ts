/**
 * Cambia la contrasena del administrador (ADMIN_EMAIL) por ADMIN_PASSWORD.
 *
 * El seed no sirve para esto: si el administrador ya existe, no lo modifica.
 * Uso:  npm run admin:password
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const MIN_PASSWORD_LENGTH = 12;
const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env.");
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `ADMIN_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error(
      `No existe un usuario con el correo ${email}. Ejecuta primero: npm run db:seed`,
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });

  console.log(`Contrasena actualizada para ${email}.`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
