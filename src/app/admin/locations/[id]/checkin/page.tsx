import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { rentals } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { CheckInForm } from "@/components/admin/CheckInForm";

export const dynamic = "force-dynamic";

export default async function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("rental", "write");
  const { id } = await params;
  const r = await db.query.rentals.findFirst({ where: eq(rentals.id, id), with: { vehicle: true, customer: true } });
  if (!r) notFound();

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href={`/admin/locations/${id}`} className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Location {r.reference}</Link>
      <div className="mt-3 mb-6">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Check-in · Remise du véhicule</div>
        <h1 className="font-display text-4xl md:text-5xl leading-none mt-1">{r.vehicle?.marque} {r.vehicle?.modele}</h1>
        <p className="font-cond text-sm text-gris mt-1">{r.customer ? `${r.customer.prenom ?? ""} ${r.customer.nom}` : "Client à confirmer"}</p>
      </div>
      <CheckInForm rentalId={id} kmDepart={r.kmDepart ?? r.vehicle?.kilometrage ?? null} />
    </div>
  );
}
