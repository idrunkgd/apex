import Link from "next/link";
import { requirePermission } from "@/lib/rbac";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { createVehicle } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function NouveauVehiculePage() {
  await requirePermission("vehicle", "write");
  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <Link href="/admin/flotte" className="font-cond text-xs tracking-wide uppercase text-gris hover:text-orange transition-colors pl-12 lg:pl-0">← Flotte</Link>
      <h1 className="font-display text-5xl leading-none mt-3 mb-6">NOUVEAU VÉHICULE</h1>
      <VehicleForm action={createVehicle} />
    </div>
  );
}
