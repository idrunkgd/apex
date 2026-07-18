import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rentals, checkIns } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { CheckOutForm } from "@/components/admin/CheckOutForm";
import { daysBetween } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CheckOutPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("rental", "write");
  const { id } = await params;
  const r = await db.query.rentals.findFirst({ where: eq(rentals.id, id), with: { vehicle: true, customer: true } });
  if (!r) notFound();
  const checkIn = await db.query.checkIns.findFirst({ where: eq(checkIns.rentalId, id) });

  const v = r.vehicle;
  const kmDepart = r.kmDepart ?? checkIn?.km ?? v?.kilometrage ?? 0;
  const carbDepart = r.carburantDepart ?? checkIn?.carburant ?? 100;
  const jours = daysBetween(r.dateDepart, r.dateRetour);
  const kmInclus = (v?.kmInclusJour ?? 0) * jours;
  const now = new Date();
  const joursRetard = now > new Date(r.dateRetour) ? daysBetween(r.dateRetour, now) : 0;

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href={`/admin/locations/${id}`} className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Location {r.reference}</Link>
      <div className="mt-3 mb-6">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Check-out · Retour du véhicule</div>
        <h1 className="font-display text-4xl md:text-5xl leading-none mt-1">{r.vehicle?.marque} {r.vehicle?.modele}</h1>
        <p className="font-cond text-sm text-gris mt-1">{r.customer ? `${r.customer.prenom ?? ""} ${r.customer.nom}` : "—"} · retour prévu le {new Intl.DateTimeFormat("fr-LU", { day: "2-digit", month: "long" }).format(new Date(r.dateRetour))}</p>
      </div>
      <CheckOutForm
        rentalId={id}
        kmDepart={kmDepart}
        carbDepart={carbDepart}
        kmInclus={kmInclus}
        prixKmSupp={v?.prixKmSupp ?? 0}
        prixJour={v?.prixJour ?? 0}
        joursRetard={joursRetard}
      />
    </div>
  );
}
