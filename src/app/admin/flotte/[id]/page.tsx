import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles, purchases, statusHistory, reservations, rentals, vehicleExpenses, vehiclePhotos } from "@/db/schema";
import { CarSilhouette } from "@/components/CarSilhouette";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { euro, km as fmtKm, dateFr, num, parseJson, coverOf } from "@/lib/format";
import { label, CARBURANT, CARROSSERIE } from "@/lib/enums";
import { requirePermission, can } from "@/lib/rbac";
import { StatusChanger } from "@/components/admin/StatusChanger";

export const dynamic = "force-dynamic";

export default async function VehicleAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("vehicle", "read");
  const canWrite = can(user.role, "vehicle", "write");
  const { id } = await params;
  const v = await db.query.vehicles.findFirst({ where: eq(vehicles.id, id) });
  if (!v) notFound();

  const purchase = await db.query.purchases.findFirst({ where: eq(purchases.vehicleId, id) });
  const history = await db.select().from(statusHistory).where(eq(statusHistory.vehicleId, id)).orderBy(desc(statusHistory.createdAt));
  const resa = await db.select().from(reservations).where(eq(reservations.vehicleId, id)).orderBy(desc(reservations.dateDepart));
  const locs = await db.select().from(rentals).where(eq(rentals.vehicleId, id));
  const expenses = await db.select().from(vehicleExpenses).where(eq(vehicleExpenses.vehicleId, id));
  const photos = await db.select().from(vehiclePhotos).where(eq(vehiclePhotos.vehicleId, id)).orderBy(vehiclePhotos.ordre);
  const cover = coverOf(photos);

  // Coût de revient
  const fraisPrep = purchase
    ? (purchase.transport ?? 0) + (purchase.preparation ?? 0) + (purchase.detailing ?? 0) + (purchase.pneus ?? 0) +
      (purchase.entretien ?? 0) + (purchase.reparations ?? 0) + (purchase.carrosserie ?? 0) + (purchase.fraisAdmin ?? 0) +
      (purchase.immatriculation ?? 0) + (purchase.autresFrais ?? 0)
    : 0;
  const depenses = expenses.reduce((s, e) => s + e.montant, 0);
  const revientTotal = (purchase?.prixAchat ?? 0) + fraisPrep + depenses;
  const revenusLoc = locs.reduce((s, r) => s + (r.total ?? 0), 0);
  const margeVente = v.prixAffiche ? v.prixAffiche - revientTotal : null;

  const equipements = parseJson<string[]>(v.equipements, []);

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href="/admin/flotte" className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Flotte</Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mt-3 mb-6">
        <div>
          <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">{v.marque} · {v.refInterne}</div>
          <h1 className="font-display text-5xl leading-none mt-1">{v.modele}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge statut={v.statut} />
            <span className="font-cond text-xs text-gris uppercase tracking-wide">{v.annee} · {fmtKm(v.kilometrage)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {canWrite && <StatusChanger id={v.id} current={v.statut} />}
          {canWrite && <Link href={`/admin/flotte/${v.id}/modifier`} className="btn-primary text-xs py-2.5">Modifier</Link>}
          <Link href={`/vehicule/${v.slug}`} className="btn-ghost text-xs py-2.5">Fiche publique →</Link>
        </div>
      </div>

      {/* Visual + finance */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 mb-6">
        <div className="border border-edge rounded-lg overflow-hidden bg-[radial-gradient(120%_100%_at_50%_40%,#1a1c21,#0a0b0d_70%)] flex items-center justify-center aspect-[16/9]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
          ) : (
            <CarSilhouette className="w-[70%]" />
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FinTile label="Coût de revient" value={euro(revientTotal)} accent />
          <FinTile label="Prix d'achat" value={euro(purchase?.prixAchat)} />
          <FinTile label="Frais de préparation" value={euro(fraisPrep + depenses)} />
          <FinTile label="Revenus location" value={euro(revenusLoc)} />
          <FinTile label="Prix affiché" value={v.prixAffiche ? euro(v.prixAffiche) : "—"} />
          <FinTile label="Marge potentielle" value={margeVente != null ? euro(margeVente) : "—"} accent={margeVente != null && margeVente > 0} />
        </div>
      </div>

      {/* Photos */}
      {canWrite && (
        <div className="mb-6">
          <PhotoManager vehicleId={v.id} photos={photos} />
        </div>
      )}

      {/* Specs + history */}
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">
        <div className="border border-edge rounded-lg bg-carbone p-6">
          <h2 className="font-cond tracking-[2px] uppercase text-sm mb-4">Fiche technique</h2>
          <div className="grid sm:grid-cols-2 gap-x-8">
            {[
              ["Puissance", `${num(v.puissanceCh)} ch`],
              ["0-100 km/h", v.accel0100 ? `${v.accel0100} s` : "—"],
              ["Vitesse max", v.vitesseMax ? `${num(v.vitesseMax)} km/h` : "—"],
              ["Moteur", v.moteur ?? "—"],
              ["Carburant", label(CARBURANT, v.carburant)],
              ["Carrosserie", label(CARROSSERIE, v.carrosserie)],
              ["Couleur", v.couleurExt ?? "—"],
              ["Destination", v.destination.replace("_", " ")],
            ].map(([k, val]) => (
              <div key={String(k)} className="flex justify-between border-b border-edge py-2.5 text-sm">
                <span className="text-gris font-cond uppercase text-xs pt-0.5">{k}</span>
                <span>{String(val)}</span>
              </div>
            ))}
          </div>
          {equipements.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {equipements.map((e) => (
                <span key={e} className="font-cond text-xs text-gris-clair border border-edge rounded-sm px-2.5 py-1">{e}</span>
              ))}
            </div>
          )}
        </div>

        <div className="border border-edge rounded-lg bg-carbone p-6">
          <h2 className="font-cond tracking-[2px] uppercase text-sm mb-4">Historique &amp; activité</h2>
          <div className="mb-5">
            <div className="font-cond text-[10px] tracking-wider uppercase text-gris mb-2">Réservations ({resa.length})</div>
            {resa.length === 0 ? <p className="text-gris text-sm font-light">Aucune.</p> : (
              <ul className="space-y-1.5">
                {resa.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex justify-between text-sm">
                    <span className="text-gris-clair">{dateFr(r.dateDepart)} → {dateFr(r.dateRetour)}</span>
                    <StatusBadge statut={r.statut} kind="reservation" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="font-cond text-[10px] tracking-wider uppercase text-gris mb-2">Changements de statut</div>
            <ul className="space-y-2">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                  <span className="text-gris-clair">{h.nouveauStatut.replace("_", " ")}</span>
                  <span className="text-gris text-xs ml-auto">{dateFr(h.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinTile({ label, value, accent }: { label: string; value?: string; accent?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 ${accent ? "border-orange/40 bg-orange/5" : "border-edge bg-carbone"}`}>
      <div className="font-cond text-[10px] tracking-[1.5px] uppercase text-gris">{label}</div>
      <div className={`font-display text-2xl mt-1.5 ${accent ? "text-orange" : "text-white"}`}>{value ?? "—"}</div>
    </div>
  );
}
