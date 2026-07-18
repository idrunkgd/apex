import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { reservations } from "@/db/schema";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ReservationActions } from "@/components/admin/ReservationActions";
import { euro, dateFr } from "@/lib/format";
import { requirePermission, can } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const user = await requirePermission("reservation", "read");
  const canWrite = can(user.role, "reservation", "write");

  const list = await db.query.reservations.findMany({
    with: { vehicle: true, customer: true, rental: true },
    orderBy: [desc(reservations.dateDepart)],
  });

  const demandes = list.filter((r) => ["DEMANDE", "OPTION"].includes(r.statut)).length;
  const enCours = list.filter((r) => r.statut === "EN_COURS").length;
  const aVenir = list.filter((r) => ["CONFIRMEE", "PAYEE", "EN_PREPARATION", "PRETE"].includes(r.statut)).length;

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="flex items-end justify-between mb-6 pl-12 lg:pl-0 flex-wrap gap-2">
        <div>
          <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Location</div>
          <h1 className="font-display text-5xl leading-none mt-1">LOCATIONS</h1>
        </div>
        <div className="font-cond text-sm text-gris">{demandes} demande(s) · {aVenir} à venir · {enCours} en cours</div>
      </div>

      <p className="font-cond text-xs text-gris mb-4">
        Cycle complet d'un dossier : demande → confirmée → en cours → terminée. « Confirmer → location » crée le contrat et débloque le check-in.
      </p>

      <div className="border border-edge rounded-lg bg-carbone overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="font-cond text-[10px] tracking-wider uppercase text-gris border-b border-edge">
              <th className="text-left px-5 py-3 font-medium">Réf.</th>
              <th className="text-left py-3 font-medium">Véhicule</th>
              <th className="text-left py-3 font-medium">Client</th>
              <th className="text-left py-3 font-medium">Période</th>
              <th className="text-right py-3 font-medium">Montant</th>
              <th className="text-left py-3 font-medium">Statut</th>
              {canWrite && <th className="text-right px-5 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const montant = r.rental?.total ?? r.prixTotal;
              const client = r.customer ? `${r.customer.prenom ?? ""} ${r.customer.nom}` : r.contactNom ?? "—";
              return (
                <tr key={r.id} className="border-b border-edge hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5 font-cond">
                    {r.rental ? (
                      <Link href={`/admin/locations/${r.rental.id}`} className="text-orange hover:underline">{r.rental.reference}</Link>
                    ) : (
                      <span className="text-gris">{r.reference}</span>
                    )}
                  </td>
                  <td className="py-3.5">{r.vehicle?.marque} {r.vehicle?.modele}</td>
                  <td className="py-3.5 text-gris-clair">{client}</td>
                  <td className="py-3.5 text-gris-clair font-cond text-xs">{dateFr(r.dateDepart)} → {dateFr(r.dateRetour)}</td>
                  <td className="py-3.5 text-right">{montant ? euro(montant) : "—"}</td>
                  <td className="py-3.5"><StatusBadge statut={r.statut} kind="reservation" /></td>
                  {canWrite && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 justify-end">
                        {r.rental && (
                          <Link href={`/admin/locations/${r.rental.id}`} className="font-cond text-[11px] tracking-wide uppercase text-orange hover:underline whitespace-nowrap">
                            Dossier →
                          </Link>
                        )}
                        <ReservationActions id={r.id} statut={r.statut} hasRental={!!r.rental} />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
