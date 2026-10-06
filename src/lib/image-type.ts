export type DetectedImage = { extension: "jpg" | "png" | "gif" | "webp"; mime: string };

const ascii = (bytes: Uint8Array, start: number, text: string) =>
  text.split("").every((char, index) => bytes[start + index] === char.charCodeAt(0));

/**
 * Detecta el tipo REAL de una imagen por los primeros bytes del archivo.
 * El tipo y el nombre que declara el navegador se pueden falsificar (un script
 * renombrado a .png); estos bytes iniciales no.
 */
export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  if (bytes.length < 12) {
    return null;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", mime: "image/jpeg" };
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (pngSignature.every((value, index) => bytes[index] === value)) {
    return { extension: "png", mime: "image/png" };
  }

  if (ascii(bytes, 0, "GIF87a") || ascii(bytes, 0, "GIF89a")) {
    return { extension: "gif", mime: "image/gif" };
  }

  if (ascii(bytes, 0, "RIFF") && ascii(bytes, 8, "WEBP")) {
    return { extension: "webp", mime: "image/webp" };
  }

  return null;
}
