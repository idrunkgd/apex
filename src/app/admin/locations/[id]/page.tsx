import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rentals, checkIns, checkOuts, deposits, payments, vehicleDamages } from "@/db/schema";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { euro, dateFr, dateTimeFr, km as fmtKm, parseJson } from "@/lib/format";
import { requirePermission, can } from "@/lib/rbac";
import { CHECKIN_ITEMS, CHECKOUT_ITEMS, PHOTO_ANGLES } from "@/lib/checklist";

export const dynamic = "force-dynamic";

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePermission("rental", "read");
  const canWrite = can(user.role, "rental", "write");
  const { id } = await params;
  const r = await db.query.rentals.findFirst({ where: eq(rentals.id, id), with: { vehicle: true, customer: true } });
  if (!r) notFound();

  const checkIn = await db.query.checkIns.findFirst({ where: eq(checkIns.rentalId, id) });
  const checkOut = await db.query.checkOuts.findFirst({ where: eq(checkOuts.rentalId, id) });
  const deposit = await db.query.deposits.findFirst({ where: eq(deposits.rentalId, id) });
  const pays = await db.select().from(payments).where(eq(payments.rentalId, id));
  const damages = await db.select().from(vehicleDamages).where(eq(vehicleDamages.rentalId, id));

  const inPhotos = parseJson<Record<string, string>>(checkIn?.photos, {});
  const outPhotos = parseJson<Record<string, string>>(checkOut?.photos, {});
  const inCheck = parseJson<Record<string, boolean>>(checkIn?.checklist, {});
  const outCheck = parseJson<Record<string, boolean>>(checkOut?.checklist, {});

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href="/admin/locations" className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Locations</Link>

      <div className="flex items-start justify-between flex-wrap gap-4 mt-3 mb-6">
        <div>
          <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">{r.reference}</div>
          <h1 className="font-display text-5xl leading-none mt-1">{r.vehicle?.marque} {r.vehicle?.modele}</h1>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <StatusBadge statut={r.statut} kind="reservation" />
            <span className="font-cond text-xs text-gris uppercase tracking-wide">{dateFr(r.dateDepart)} → {dateFr(r.dateRetour)}</span>
          </div>
        </div>
        {canWrite && (
          <div className="flex gap-3">
            {!checkIn && !["TERMINEE", "ANNULEE"].includes(r.statut) && (
              <Link href={`/admin/locations/${id}/checkin`} className="btn-primary text-sm py-2.5">Démarrer le check-in →</Link>
            )}
            {!checkOut && (checkIn || r.statut === "EN_COURS") && !["TERMINEE", "ANNULEE"].includes(r.statut) && (
              <Link href={`/admin/locations/${id}/checkout`} className="btn-ghost text-sm py-2.5">Effectuer le retour →</Link>
            )}
          </div>
        )}
      </div>

      {/* Résumé */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile label="Client" value={r.customer ? `${r.customer.prenom ?? ""} ${r.customer.nom}` : "—"} />
        <Tile label="Total location" value={euro(r.total)} />
        <Tile label="Caution" value={deposit ? `${euro(deposit.montant)}` : "—"} hint={deposit?.statut} />
        <Tile label="Frais retour" value={euro(r.fraisSupp ?? 0)} accent={(r.fraisSupp ?? 0) > 0} />
      </div>

      {/* DOCUMENTS PDF */}
      <div className="border border-edge rounded-lg bg-carbone p-6 mb-6">
        <h2 className="font-cond tracking-[2px] uppercase text-sm mb-4">Documents</h2>
        <div className="flex flex-wrap gap-3">
          <DocLink id={id} type="contrat" label="Contrat de location" />
          <DocLink id={id} type="facture" label="Facture" />
          {checkIn && <DocLink id={id} type="edl-depart" label="État des lieux — départ" />}
          {checkOut && <DocLink id={id} type="edl-retour" label="État des lieux — retour" />}
        </div>
        <p className="font-cond text-[11px] text-gris mt-3">Les PDF sont générés à la volée depuis les données réelles et archivés dans l'historique.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CHECK-IN */}
        <Panel title="État des lieux — départ">
          {!checkIn ? (
            <Empty text="Check-in non encore effectué." />
          ) : (
            <>
              <p className="font-cond text-[11px] text-gris mb-3">
                Réalisé par <span className="text-orange">{checkIn.agentNom ?? "—"}</span> · {dateTimeFr(checkIn.createdAt)}
              </p>
              <div className="flex gap-6 mb-4 font-cond text-sm">
                <span className="text-gris-clair">Km : <b className="text-white">{fmtKm(checkIn.km)}</b></span>
                <span className="text-gris-clair">Carburant : <b className="text-white">{checkIn.carburant}%</b></span>
              </div>
              <ChecklistView items={CHECKIN_ITEMS} state={inCheck} />
              <PhotoGrid photos={inPhotos} />
              {checkIn.signature && (
                <div className="mt-4">
                  <div className="font-cond text-[10px] tracking-wider uppercase text-gris mb-1">Signature client</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={checkIn.signature} alt="Signature" className="h-20 bg-white rounded-sm border border-edge" />
                </div>
              )}
            </>
          )}
        </Panel>

        {/* CHECK-OUT */}
        <Panel title="État des lieux — retour">
          {!checkOut ? (
            <Empty text="Retour non encore effectué." />
          ) : (
            <>
              <p className="font-cond text-[11px] text-gris mb-3">
                Réalisé par <span className="text-orange">{checkOut.agentNom ?? "—"}</span> · {dateTimeFr(checkOut.createdAt)}
              </p>
              <div className="flex gap-6 mb-4 font-cond text-sm">
                <span className="text-gris-clair">Km : <b className="text-white">{fmtKm(checkOut.km)}</b></span>
                <span className="text-gris-clair">Carburant : <b className="text-white">{checkOut.carburant}%</b></span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <FeeTile label="Km supp." value={checkOut.fraisKm ?? 0} />
                <FeeTile label="Retard" value={checkOut.fraisRetard ?? 0} />
                <FeeTile label="Carburant" value={checkOut.fraisCarburant ?? 0} />
              </div>
              <ChecklistView items={CHECKOUT_ITEMS} state={outCheck} />
              <PhotoGrid photos={outPhotos} />
            </>
          )}
        </Panel>
      </div>

      {/* Dommages & paiements */}
      {(damages.length > 0 || pays.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Panel title="Dommages">
            {damages.length === 0 ? <Empty text="Aucun dommage." /> : (
              <ul className="space-y-2">
                {damages.map((d) => (
                  <li key={d.id} className="flex justify-between text-sm border-b border-edge pb-2">
                    <span className="text-gris-clair">{d.zone} — {d.description}</span>
                    <StatusBadge statut={d.statut} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Paiements">
            {pays.length === 0 ? <Empty text="Aucun paiement." /> : (
              <ul className="space-y-2">
                {pays.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm border-b border-edge pb-2">
                    <span className="text-gris-clair">{p.type} · {p.methode ?? "—"}</span>
                    <span><b>{euro(p.montant)}</b> <span className="text-gris text-xs">{p.statut}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function DocLink({ id, type, label }: { id: string; type: string; label: string }) {
  return (
    <a
      href={`/admin/locations/${id}/documents/${type}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 font-cond text-xs tracking-wide uppercase px-4 py-2.5 rounded-sm border border-edge text-gris-clair hover:border-orange hover:text-orange transition-colors"
    >
      <span className="text-base leading-none">▤</span>
      {label}
      <span className="text-orange">PDF</span>
    </a>
  );
}

function Tile({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 bg-carbone ${accent ? "border-orange/40" : "border-edge"}`}>
      <div className="font-cond text-[10px] tracking-[1.5px] uppercase text-gris">{label}</div>
      <div className={`font-display text-2xl mt-1 ${accent ? "text-orange" : "text-white"}`}>{value}</div>
      {hint && <div className="font-cond text-[10px] uppercase text-gris mt-1">{hint}</div>}
    </div>
  );
}
function FeeTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-edge rounded-sm p-3 text-center">
      <div className="font-display text-xl">{euro(value)}</div>
      <div className="font-cond text-[9px] tracking-wide uppercase text-gris mt-1">{label}</div>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-edge rounded-lg bg-carbone p-6">
      <h2 className="font-cond tracking-[2px] uppercase text-sm mb-4">{title}</h2>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <p className="text-gris font-light text-sm">{text}</p>;
}
function ChecklistView({ items, state }: { items: { key: string; label: string }[]; state: Record<string, boolean> }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 mb-4">
      {items.map((it) => (
        <div key={it.key} className="flex items-center gap-2 text-xs font-cond">
          <span className={state[it.key] ? "text-emerald-400" : "text-gris/50"}>{state[it.key] ? "✓" : "○"}</span>
          <span className={state[it.key] ? "text-gris-clair" : "text-gris/60"}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}
function PhotoGrid({ photos }: { photos: Record<string, string> }) {
  const entries = PHOTO_ANGLES.filter((a) => photos[a.key]);
  if (entries.length === 0) return null;
  return (
    <div className="grid grid-cols-4 gap-2 mt-2">
      {entries.map((a) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={a.key} src={photos[a.key]} alt={a.label} className="aspect-[4/3] object-cover rounded-sm border border-edge" />
      ))}
    </div>
  );
}
