import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { updateVehicle } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function ModifierVehiculePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("vehicle", "write");
  const { id } = await params;
  const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.id, id) });
  if (!vehicle) notFound();

  const action = updateVehicle.bind(null, id);

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href={`/admin/flotte/${id}`} className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Fiche véhicule</Link>
      <h1 className="font-display text-5xl leading-none mt-3 mb-1">MODIFIER</h1>
      <p className="font-cond text-sm text-gris mb-6">{vehicle.marque} {vehicle.modele} · {vehicle.refInterne}</p>
      <VehicleForm action={action} vehicle={vehicle} />
    </div>
  );
}
