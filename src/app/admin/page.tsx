import Link from "next/link";
import { db } from "@/lib/db";
import { vehicles, reservations, rentals, payments, notifications } from "@/db/schema";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { euro, dateFr } from "@/lib/format";
import { requireUser } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default async function DashboardPage() {
  const user = await requireUser();

  const allVehicles = await db.select().from(vehicles);
  const allRes = await db.query.reservations.findMany({ with: { vehicle: true, customer: true } });
  const allRentals = await db.query.rentals.findMany({ with: { vehicle: true, customer: true } });
  const allPayments = await db.select().from(payments);
  const notifs = await db.select().from(notifications).limit(6);

  const fleet = allVehicles.length;
  const onRoad = allVehicles.filter((v) => v.statut === "LOUE").length;
  const available = allVehicles.filter((v) => ["DISPONIBLE", "A_LOUER", "A_VENDRE"].includes(v.statut)).length;
  const service = allVehicles.filter((v) => ["EN_MAINTENANCE", "EN_PREPARATION"].includes(v.statut)).length;

  const now = new Date();
  const departsToday = allRentals.filter((r) => sameDay(new Date(r.dateDepart), now));
  const returnsToday = allRentals.filter((r) => r.statut === "EN_COURS" && sameDay(new Date(r.dateRetour), now));
  const upcoming = allRes
    .filter((r) => new Date(r.dateDepart) >= now && ["DEMANDE", "OPTION", "CONFIRMEE", "PAYEE"].includes(r.statut))
    .sort((a, b) => +new Date(a.dateDepart) - +new Date(b.dateDepart));
  const enCours = allRentals.filter((r) => r.statut === "EN_COURS");

  const caLocation = allPayments.filter((p) => p.type === "LOCATION" && p.statut === "PAYE").reduce((s, p) => s + p.montant, 0);
  const pendingPayments = allRes.filter((r) => r.statut === "DEMANDE" || r.statut === "OPTION").length;
  const cautions = allRentals.filter((r) => r.statut === "EN_COURS").length;
  const occupation = fleet ? Math.round((onRoad / fleet) * 100) : 0;

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-8 pl-12 lg:pl-0">
        <div>
          <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Cockpit</div>
          <h1 className="font-display text-5xl leading-none mt-1">TABLEAU DE BORD</h1>
        </div>
        <div className="font-cond text-sm text-gris">Bonjour {user.nom.split(" ")[0]} · {dateFr(now)}</div>
      </div>

      {/* Flotte cockpit */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard label="Flotte" value={fleet} unit="véh." accent />
        <StatCard label="Sur la route" value={onRoad} hint="En location" />
        <StatCard label="Disponibles" value={available} hint="Prêts à partir" />
        <StatCard label="En service" value={service} hint="Prépa / maintenance" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="CA location" value={euro(caLocation)} />
        <StatCard label="Taux d'occupation" value={occupation} unit="%" />
        <StatCard label="À traiter" value={pendingPayments} hint="Demandes en attente" accent={pendingPayments > 0} />
        <StatCard label="Cautions actives" value={cautions} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Locations en cours */}
        <div className="lg:col-span-2 border border-edge rounded-lg bg-carbone">
          <div className="flex items-center justify-between px-5 py-4 border-b border-edge">
            <h2 className="font-cond tracking-[2px] uppercase text-sm">Locations en cours</h2>
            <Link href="/admin/locations" className="font-cond text-xs text-orange tracking-wide uppercase">Tout voir →</Link>
          </div>
          {enCours.length === 0 ? (
            <p className="text-gris font-light p-6 text-sm">Aucune location en cours.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="font-cond text-[10px] tracking-wider uppercase text-gris">
                  <th className="text-left px-5 py-2 font-medium">Réf.</th>
                  <th className="text-left py-2 font-medium">Véhicule</th>
                  <th className="text-left py-2 font-medium">Client</th>
                  <th className="text-left py-2 font-medium">Retour</th>
                </tr>
              </thead>
              <tbody>
                {enCours.map((r) => (
                  <tr key={r.id} className="border-t border-edge">
                    <td className="px-5 py-3 font-cond text-orange">{r.reference}</td>
                    <td className="py-3">{r.vehicle?.marque} {r.vehicle?.modele}</td>
                    <td className="py-3 text-gris-clair">{r.customer ? `${r.customer.prenom ?? ""} ${r.customer.nom}` : "—"}</td>
                    <td className="py-3 text-gris-clair">{dateFr(r.dateRetour)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Alertes / notifications */}
        <div className="border border-edge rounded-lg bg-carbone">
          <div className="px-5 py-4 border-b border-edge">
            <h2 className="font-cond tracking-[2px] uppercase text-sm">Alertes</h2>
          </div>
          <div className="divide-y divide-edge">
            {notifs.length === 0 ? (
              <p className="text-gris font-light p-6 text-sm">Aucune alerte.</p>
            ) : (
              notifs.map((n) => (
                <Link key={n.id} href={n.lien ?? "#"} className="block px-5 py-3.5 hover:bg-white/5 transition-colors">
                  <div className="font-cond text-[10px] tracking-wider uppercase text-orange">{n.type}</div>
                  <div className="text-sm text-gris-clair font-light mt-0.5">{n.message}</div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Départs & prochaines réservations */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="border border-edge rounded-lg bg-carbone p-5">
          <h2 className="font-cond tracking-[2px] uppercase text-sm mb-4">Départs / retours du jour</h2>
          {departsToday.length + returnsToday.length === 0 ? (
            <p className="text-gris font-light text-sm">Rien de prévu aujourd'hui.</p>
          ) : (
            <ul className="space-y-2">
              {departsToday.map((r) => (
                <li key={"d" + r.id} className="flex justify-between text-sm border-b border-edge pb-2">
                  <span><span className="text-emerald-400 font-cond text-xs uppercase mr-2">Départ</span>{r.vehicle?.marque} {r.vehicle?.modele}</span>
                  <span className="text-gris">{r.reference}</span>
                </li>
              ))}
              {returnsToday.map((r) => (
                <li key={"r" + r.id} className="flex justify-between text-sm border-b border-edge pb-2">
                  <span><span className="text-orange font-cond text-xs uppercase mr-2">Retour</span>{r.vehicle?.marque} {r.vehicle?.modele}</span>
                  <span className="text-gris">{r.reference}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-edge rounded-lg bg-carbone p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-cond tracking-[2px] uppercase text-sm">Prochaines réservations</h2>
            <Link href="/admin/locations" className="font-cond text-xs text-orange tracking-wide uppercase">Tout voir →</Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-gris font-light text-sm">Aucune réservation à venir.</p>
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">{r.vehicle?.marque} {r.vehicle?.modele}</div>
                    <div className="font-cond text-xs text-gris">{dateFr(r.dateDepart)} → {dateFr(r.dateRetour)}</div>
                  </div>
                  <StatusBadge statut={r.statut} kind="reservation" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
