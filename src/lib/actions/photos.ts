"use server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { vehiclePhotos, vehicles } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

const MAX_BYTES = 10 * 1024 * 1024; // 10 Mo
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function extFor(type: string) {
  return { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" }[type] ?? "jpg";
}

export async function uploadVehiclePhotos(
  vehicleId: string,
  _prev: { ok?: boolean; error?: string },
  fd: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  await requirePermission("vehicle", "write");
  const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.id, vehicleId) });
  if (!vehicle) return { error: "Véhicule introuvable." };

  const categorie = String(fd.get("categorie") || "EXTERIEUR");
  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { error: "Sélectionnez au moins une image." };

  const dir = path.join(process.cwd(), "public", "uploads", vehicleId);
  await mkdir(dir, { recursive: true });

  // ordre de départ + y a-t-il déjà une cover ?
  const existing = await db.select().from(vehiclePhotos).where(eq(vehiclePhotos.vehicleId, vehicleId));
  const hasReal = existing.some((p) => p.url);
  let ordre = existing.reduce((m, p) => Math.max(m, p.ordre), 0);

  let firstUrl: string | null = null;
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) return { error: `Format non supporté : ${file.type || "inconnu"} (JPEG, PNG, WebP, AVIF).` };
    if (file.size > MAX_BYTES) return { error: `Image trop lourde (max 10 Mo) : ${file.name}` };
    const name = `${crypto.randomUUID()}.${extFor(file.type)}`;
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    const url = `/uploads/${vehicleId}/${name}`;
    ordre += 1;
    if (!firstUrl) firstUrl = url;
    await db.insert(vehiclePhotos).values({ vehicleId, url, categorie, ordre, cover: false });
  }

  // première vraie photo -> devient cover
  if (!hasReal && firstUrl) {
    await db.update(vehiclePhotos).set({ cover: false }).where(eq(vehiclePhotos.vehicleId, vehicleId));
    await db.update(vehiclePhotos).set({ cover: true }).where(and(eq(vehiclePhotos.vehicleId, vehicleId), eq(vehiclePhotos.url, firstUrl)));
  }

  revalidatePath(`/admin/flotte/${vehicleId}`);
  revalidatePath(`/vehicule/${vehicle.slug}`);
  revalidatePath("/location");
  revalidatePath("/vente");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteVehiclePhoto(photoId: string) {
  await requirePermission("vehicle", "write");
  const photo = await db.query.vehiclePhotos.findFirst({ where: eq(vehiclePhotos.id, photoId) });
  if (!photo) return;

  await db.delete(vehiclePhotos).where(eq(vehiclePhotos.id, photoId));
  if (photo.url) {
    try {
      await unlink(path.join(process.cwd(), "public", photo.url));
    } catch {
      /* fichier déjà absent, on ignore */
    }
  }
  // si on a supprimé la cover, promouvoir une autre photo
  if (photo.cover) {
    const next = await db
      .select()
      .from(vehiclePhotos)
      .where(and(eq(vehiclePhotos.vehicleId, photo.vehicleId), /* url non vide géré côté JS */ eq(vehiclePhotos.vehicleId, photo.vehicleId)))
      .orderBy(desc(vehiclePhotos.ordre));
    const candidate = next.find((p) => p.url);
    if (candidate) await db.update(vehiclePhotos).set({ cover: true }).where(eq(vehiclePhotos.id, candidate.id));
  }
  revalidatePath(`/admin/flotte/${photo.vehicleId}`);
  revalidatePath("/location");
  revalidatePath("/vente");
  revalidatePath("/");
}

export async function setCoverPhoto(photoId: string) {
  await requirePermission("vehicle", "write");
  const photo = await db.query.vehiclePhotos.findFirst({ where: eq(vehiclePhotos.id, photoId) });
  if (!photo) return;
  await db.update(vehiclePhotos).set({ cover: false }).where(eq(vehiclePhotos.vehicleId, photo.vehicleId));
  await db.update(vehiclePhotos).set({ cover: true }).where(eq(vehiclePhotos.id, photoId));
  revalidatePath(`/admin/flotte/${photo.vehicleId}`);
  revalidatePath("/location");
  revalidatePath("/vente");
  revalidatePath("/");
}
