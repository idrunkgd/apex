import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_BYTES = 10 * 1024 * 1024;
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Enregistre une image dans public/uploads/<subdir> et renvoie l'URL publique, ou null si fichier vide. */
export async function saveImage(file: File, subdir: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!EXT[file.type]) throw new Error(`Format non supporté : ${file.type || "inconnu"}`);
  if (file.size > MAX_BYTES) throw new Error(`Image trop lourde (max 10 Mo) : ${file.name}`);
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  const name = `${crypto.randomUUID()}.${EXT[file.type]}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${subdir}/${name}`;
}
