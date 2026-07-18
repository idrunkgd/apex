import { db } from "@/lib/db";
import { euro } from "@/lib/format";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const PIPELINE: { key: string; label: string }[] = [
  { key: "PROSPECT", label: "Prospect" },
  { key: "CONTACT", label: "Contact établi" },
  { key: "ESSAI", label: "Essai" },
  { key: "OFFRE", label: "Offre envoyée" },
  { key: "RESERVE", label: "Réservé" },
  { key: "VENDU", label: "Vendu" },
];

export default async function VentesPage() {
  await requirePermission("sale", "read");
  const sales = await db.query.sales.findMany({ with: { vehicle: true, customer: true } });

  return (
    <div className="p-5 md:p-8 max-w-[1500px]">
      <div className="mb-6 pl-12 lg:pl-0">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Commercial</div>
        <h1 className="font-display text-5xl leading-none mt-1">PIPELINE DE VENTE</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {PIPELINE.map((col) => {
          const items = sales.filter((s) => s.statut === col.key);
          return (
            <div key={col.key} className="min-w-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-cond text-xs tracking-[1.5px] uppercase text-gris-clair">{col.label}</span>
                <span className="font-cond text-xs text-orange">{items.length}</span>
              </div>
              <div className="space-y-3 min-h-[80px]">
                {items.map((s) => (
                  <div key={s.id} className="border border-edge rounded-lg bg-carbone p-3.5 hover:border-orange/40 transition-colors">
                    <div className="font-cond text-[10px] uppercase text-gris">{s.vehicle?.marque}</div>
                    <div className="font-medium leading-tight">{s.vehicle?.modele}</div>
                    <div className="font-display text-lg text-orange mt-2">{euro(s.prixNegocie ?? s.prixAffiche)}</div>
                    {s.customer && <div className="text-xs text-gris-clair font-light mt-1">{s.customer.prenom} {s.customer.nom}</div>}
                  </div>
                ))}
                {items.length === 0 && <div className="border border-dashed border-edge/60 rounded-lg h-16" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
