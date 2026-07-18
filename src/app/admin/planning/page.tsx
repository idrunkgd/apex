import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const BLOCKING = ["CONFIRMEE", "PAYEE", "EN_PREPARATION", "PRETE", "REMISE", "EN_COURS", "RETOUR_ATTENDU", "DEMANDE", "OPTION"];

export default async function PlanningPage() {
  await requirePermission("planning", "read");

  const list = await db.query.vehicles.findMany({
    with: { reservations: true },
  });

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const DAYS = 14;
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const occupied = (vehId: string, day: Date) => {
    const veh = list.find((v) => v.id === vehId);
    if (!veh) return false;
    return veh.reservations.some((r) => {
      if (!BLOCKING.includes(r.statut)) return false;
      const dep = new Date(r.dateDepart); dep.setHours(0, 0, 0, 0);
      const ret = new Date(r.dateRetour); ret.setHours(0, 0, 0, 0);
      return day >= dep && day <= ret;
    });
  };

  const dow = ["D", "L", "M", "M", "J", "V", "S"];

  return (
    <div className="p-5 md:p-8 max-w-[1500px]">
      <div className="mb-6 pl-12 lg:pl-0">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">Location</div>
        <h1 className="font-display text-5xl leading-none mt-1">PLANNING DE FLOTTE</h1>
        <p className="font-cond text-sm text-gris mt-2">14 prochains jours · disponibilités &amp; réservations</p>
      </div>

      <div className="border border-edge rounded-lg bg-carbone overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-edge">
              <th className="text-left px-4 py-3 font-cond text-[10px] tracking-wider uppercase text-gris sticky left-0 bg-carbone">Véhicule</th>
              {days.map((d, i) => (
                <th key={i} className="py-2 font-cond text-[10px] text-center text-gris w-9">
                  <div>{dow[d.getDay()]}</div>
                  <div className="text-gris-clair">{d.getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((v) => (
              <tr key={v.id} className="border-b border-edge">
                <td className="px-4 py-2.5 sticky left-0 bg-carbone whitespace-nowrap">
                  <span className="text-gris text-[10px] font-cond uppercase block leading-none">{v.marque}</span>
                  <span className="text-xs">{v.modele}</span>
                </td>
                {days.map((d, i) => {
                  const busy = occupied(v.id, d);
                  return (
                    <td key={i} className="p-1 text-center">
                      <div className={`h-6 rounded-sm ${busy ? "bg-orange/70" : "bg-white/[.03] border border-edge/50"}`} title={busy ? "Réservé" : "Disponible"} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-6 mt-4 font-cond text-xs text-gris">
        <span className="flex items-center gap-2"><span className="w-4 h-3 rounded-sm bg-orange/70" /> Réservé / loué</span>
        <span className="flex items-center gap-2"><span className="w-4 h-3 rounded-sm bg-white/[.03] border border-edge/50" /> Disponible</span>
      </div>
    </div>
  );
}
