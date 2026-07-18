import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { euro, km as fmtKm } from "@/lib/format";
import { requirePermission } from "@/lib/rbac";
import { can } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function FlottePage() {
  const user = await requirePermission("vehicle", "read");
  const canWrite = can(user.role, "vehicle", "write");
  const list = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));

  const stats = {
    total: list.length,
    location: list.filter((v) => ["LOCATION", "LES_DEUX"].includes(v.destination)).length,
    vente: list.filter((v) => ["VENTE", "LES_DEUX"].includes(v.destination)).length,
  };

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6 pl-12 lg:pl-0">
        <div>
          <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Flotte</div>
          <h1 className="font-display text-5xl leading-none mt-1">GESTION DE LA FLOTTE</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-cond text-sm text-gris hidden sm:block">
            {stats.total} véhicules · {stats.location} loc. · {stats.vente} vente
          </span>
          {canWrite && (
            <Link href="/admin/flotte/nouveau" className="btn-primary text-xs py-2.5">+ Nouveau véhicule</Link>
          )}
        </div>
      </div>

      <div className="border border-edge rounded-lg bg-carbone overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="font-cond text-[10px] tracking-wider uppercase text-gris border-b border-edge">
              <th className="text-left px-5 py-3 font-medium">Réf.</th>
              <th className="text-left py-3 font-medium">Véhicule</th>
              <th className="text-left py-3 font-medium">Statut</th>
              <th className="text-left py-3 font-medium">Km</th>
              <th className="text-right py-3 font-medium">Vente</th>
              <th className="text-right px-5 py-3 font-medium">Location</th>
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-b border-edge hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5 font-cond text-gris">{v.refInterne}</td>
                <td className="py-3.5">
                  <Link href={`/admin/flotte/${v.id}`} className="hover:text-orange transition-colors">
                    <span className="text-gris text-xs font-cond uppercase block">{v.marque}</span>
                    <span className="font-medium">{v.modele}</span>
                  </Link>
                </td>
                <td className="py-3.5"><StatusBadge statut={v.statut} /></td>
                <td className="py-3.5 text-gris-clair">{fmtKm(v.kilometrage)}</td>
                <td className="py-3.5 text-right text-gris-clair">{v.prixAffiche ? euro(v.prixAffiche) : "—"}</td>
                <td className="px-5 py-3.5 text-right text-orange">{v.prixJour ? euro(v.prixJour, { perDay: true }) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
