"use server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";
import { HERO_FILE } from "@/lib/site";

export type SettingsState = { ok?: boolean; error?: string };

export async function uploadHeroImage(_prev: SettingsState, fd: FormData): Promise<SettingsState> {
  await requirePermission("vehicle", "write"); // réservé aux rôles gestion/admin
  const file = fd.get("hero");
  if (!(file instanceof File) || file.size === 0) return { error: "Sélectionnez une image." };
  if (file.size > 15 * 1024 * 1024) return { error: "Image trop lourde (max 15 Mo)." };

  const dir = path.dirname(HERO_FILE);
  await mkdir(dir, { recursive: true });

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const { default: sharp } = await import("sharp");
    const jpg = await sharp(buf).rotate().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    await writeFile(HERO_FILE, jpg);
  } catch {
    // sharp indisponible : on n'accepte que le JPEG brut
    if (!["image/jpeg", "image/jpg"].includes(file.type)) {
      return { error: "Format non pris en charge sans conversion — envoyez un JPEG." };
    }
    await writeFile(HERO_FILE, buf);
  }

  revalidatePath("/");
  revalidatePath("/admin/parametres");
  return { ok: true };
}

export async function removeHeroImage(): Promise<void> {
  await requirePermission("vehicle", "write");
  try {
    await unlink(HERO_FILE);
  } catch {
    /* déjà absente */
  }
  revalidatePath("/");
  revalidatePath("/admin/parametres");
}
