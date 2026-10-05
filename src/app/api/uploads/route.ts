import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/auth-options";
import { slugifyText } from "@/lib/utils";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!["ADMIN", "EMPLOYEE"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
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

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Solo se permiten imagenes JPG, PNG, WEBP o GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Cada imagen debe pesar maximo 5MB." },
        { status: 400 },
      );
    }

    const extension = getExtension(file);
    const filename = `${Date.now()}-${slugifyText(file.name)}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(uploadDir, filename), bytes);
    urls.push(`/uploads/products/${filename}`);
  }

  return NextResponse.json({ urls }, { status: 201 });
}

function getExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && ["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
    return extension;
  }

  return file.type.split("/")[1] ?? "jpg";
}
