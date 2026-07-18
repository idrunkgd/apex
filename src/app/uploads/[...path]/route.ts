import { readFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Répertoire des uploads : disque persistant en prod (/data/uploads), public/uploads en local.
const DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const rel = (parts || []).join("/");
  const full = path.join(DIR, rel);

  // Sécurité : empêcher toute sortie du dossier (path traversal)
  if (!path.resolve(full).startsWith(path.resolve(DIR))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const buf = await readFile(full);
    const ext = full.split(".").pop()?.toLowerCase() ?? "";
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
