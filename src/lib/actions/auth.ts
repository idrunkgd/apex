"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, activityLogs } from "@/db/schema";
import { createSession, destroySession } from "@/lib/session";

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) return { error: "Email et mot de passe requis." };

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !user.actif) return { error: "Identifiants invalides." };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: "Identifiants invalides." };

  await createSession({ id: user.id, email: user.email, nom: user.nom, role: user.role });
  await db.insert(activityLogs).values({ userId: user.id, action: "LOGIN", entite: "User", entiteId: user.id });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
