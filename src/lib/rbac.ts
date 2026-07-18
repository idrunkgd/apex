import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";

// Permissions par rôle : ressource -> actions autorisées
const MATRIX: Record<string, Record<string, string[]>> = {
  ADMIN: { "*": ["*"] },
  GESTIONNAIRE: {
    vehicle: ["read", "write"],
    rental: ["read", "write"],
    reservation: ["read", "write"],
    sale: ["read", "write"],
    customer: ["read", "write"],
    planning: ["read"],
    contract: ["read", "write"],
    dashboard: ["read"],
  },
  EMPLOYE: {
    vehicle: ["read"],
    rental: ["read", "write"],
    reservation: ["read", "write"],
    customer: ["read"],
    planning: ["read"],
    checkin: ["read", "write"],
    dashboard: ["read"],
  },
  COMPTABILITE: {
    vehicle: ["read"],
    payment: ["read", "write"],
    finance: ["read"],
    sale: ["read"],
    rental: ["read"],
    dashboard: ["read"],
  },
};

export function can(role: string, resource: string, action: string): boolean {
  const r = MATRIX[role];
  if (!r) return false;
  if (r["*"]?.includes("*")) return true;
  const allowed = r[resource];
  if (!allowed) return false;
  return allowed.includes("*") || allowed.includes(action);
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(resource: string, action: string): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, resource, action)) redirect("/admin?denied=1");
  return user;
}
