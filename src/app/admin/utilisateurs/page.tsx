import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { label, ROLES } from "@/lib/enums";
import { dateFr } from "@/lib/format";
import { UserCreateForm } from "@/components/admin/UserCreateForm";
import { UserRowActions } from "@/components/admin/UserRowActions";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requirePermission("user", "read"); // réservé aux administrateurs
  const list = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="mb-6 pl-12 lg:pl-0">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Administration</div>
        <h1 className="font-display text-5xl leading-none mt-1">UTILISATEURS</h1>
      </div>

      <div className="mb-6">
        <UserCreateForm />
      </div>

      <div className="border border-edge rounded-lg bg-carbone overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="font-cond text-[10px] tracking-wider uppercase text-gris border-b border-edge">
              <th className="text-left px-5 py-3 font-medium">Nom</th>
              <th className="text-left py-3 font-medium">Email</th>
              <th className="text-left py-3 font-medium">Rôle</th>
              <th className="text-left py-3 font-medium">Statut</th>
              <th className="text-left py-3 font-medium">Créé le</th>
              <th className="text-right px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-edge hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  {u.nom}{u.id === me.id && <span className="text-orange text-xs ml-2">(vous)</span>}
                </td>
                <td className="py-3.5 text-gris-clair">{u.email}</td>
                <td className="py-3.5">
                  <span className="font-cond text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm border border-edge text-gris-clair">
                    {label(ROLES as Record<string, string>, u.role)}
                  </span>
                </td>
                <td className="py-3.5">
                  {u.actif ? (
                    <span className="text-emerald-400 font-cond text-xs uppercase tracking-wide">Actif</span>
                  ) : (
                    <span className="text-red-400 font-cond text-xs uppercase tracking-wide">Désactivé</span>
                  )}
                </td>
                <td className="py-3.5 text-gris-clair font-cond text-xs">{dateFr(u.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <UserRowActions id={u.id} actif={u.actif} isSelf={u.id === me.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-cond text-xs text-gris mt-4">
        Rôles : <b className="text-gris-clair">Administrateur</b> (accès complet) · <b className="text-gris-clair">Gestionnaire</b> (flotte, clients, locations, ventes) ·
        <b className="text-gris-clair"> Employé</b> (opérationnel, check-in/out) · <b className="text-gris-clair">Comptabilité</b> (finances, paiements). Seul un administrateur gère les comptes.
      </p>
    </div>
  );
}
