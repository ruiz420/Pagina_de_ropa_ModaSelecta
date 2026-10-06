import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getStaffSession } from "@/features/auth/require-staff";
import { detectImageType } from "@/lib/image-type";
import { isStorageConfigured, uploadPublicFile } from "@/lib/storage";
import { slugifyText } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

/**
 * Sube fotos de productos (solo personal).
 * - Con Supabase Storage configurado, se guardan alli (obligatorio en hosting
 *   en la nube, donde el disco es de solo lectura).
 * - Sin el, se guardan en public/uploads (desarrollo o servidor propio).
 * El tipo se valida por el contenido real del archivo, no por lo que declara el navegador.
 */
export async function POST(request: Request) {
  if (!(await getStaffSession())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const useStorage = isStorageConfigured();

  // En hosting de solo lectura (Vercel) sin Storage la subida no puede funcionar.
  if (!useStorage && process.env.VERCEL) {
    return NextResponse.json(
      { message: "El almacenamiento de imagenes no esta configurado (Supabase Storage)." },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll("files")
    .filter((file): file is File => file instanceof File);

  if (!files.length) {
    return NextResponse.json(
      { message: "Selecciona al menos una imagen." },
      { status: 400 },
    );
  }

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { message: `Puedes subir hasta ${MAX_FILES} imagenes a la vez.` },
      { status: 400 },
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const urls: string[] = [];

  try {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { message: "Cada imagen debe pesar maximo 5MB." },
          { status: 400 },
        );
      }

      const bytes = new Uint8Array(await file.arrayBuffer());
      const image = detectImageType(bytes);

      if (!image) {
        return NextResponse.json(
          { message: "Solo se permiten imagenes JPG, PNG, WEBP o GIF." },
          { status: 400 },
        );
      }

      const baseName = slugifyText(file.name.replace(/\.[^.]+$/, "")) || "foto";
      const filename = `${Date.now()}-${randomBytes(3).toString("hex")}-${baseName}.${image.extension}`;

      if (useStorage) {
        urls.push(await uploadPublicFile(`products/${filename}`, bytes, image.mime));
      } else {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), bytes);
        urls.push(`/uploads/products/${filename}`);
      }
    }
  } catch (error) {
    console.error("[uploads] no se pudo guardar la imagen", error);
    return NextResponse.json(
      { message: "No se pudo guardar la imagen. Intenta de nuevo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ urls }, { status: 201 });
}
