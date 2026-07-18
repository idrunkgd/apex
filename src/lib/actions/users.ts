"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, activityLogs } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export type UserFormState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  nom: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe : 6 caractères minimum"),
  role: z.enum(["ADMIN", "GESTIONNAIRE", "EMPLOYE", "COMPTABILITE"]),
});

export async function createUser(_prev: UserFormState, fd: FormData): Promise<UserFormState> {
  const admin = await requirePermission("user", "write");
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    parsed.error.issues.forEach((i) => (fe[String(i.path[0])] = i.message));
    return { error: "Merci de corriger les champs indiqués.", fieldErrors: fe };
  }
  const d = parsed.data;
  const email = d.email.trim().toLowerCase();

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return { error: "Un compte utilise déjà cet email.", fieldErrors: { email: "Email déjà utilisé" } };

  const passwordHash = await bcrypt.hash(d.password, 10);
  await db.insert(users).values({ nom: d.nom, email, passwordHash, role: d.role, actif: true });
  await db.insert(activityLogs).values({ userId: admin.id, action: "CREATE", entite: "User", entiteId: email });

  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function setUserActive(id: string, actif: boolean) {
  const admin = await requirePermission("user", "write");
  if (id === admin.id) return; // ne pas se désactiver soi-même
  await db.update(users).set({ actif }).where(eq(users.id, id));
  revalidatePath("/admin/utilisateurs");
}

export async function resetUserPassword(id: string, password: string) {
  await requirePermission("user", "write");
  if (!password || password.length < 6) return;
  const passwordHash = await bcrypt.hash(password, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  revalidatePath("/admin/utilisateurs");
}
