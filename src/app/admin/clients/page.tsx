import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers } from "@/db/schema";
import { dateFr } from "@/lib/format";
import { requirePermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  await requirePermission("customer", "read");
  const list = await db.query.customers.findMany({
    with: { reservations: true, rentals: true, sales: true },
    orderBy: [desc(customers.createdAt)],
  });

  return (
    <div className="p-5 md:p-8 max-w-[1400px]">
      <div className="mb-6 pl-12 lg:pl-0">
        <div className="font-cond text-[11px] tracking-[3px] uppercase text-orange">CRM</div>
        <h1 className="font-display text-5xl leading-none mt-1">CLIENTS</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => (
          <div key={c.id} className="border border-edge rounded-lg bg-carbone p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-display text-2xl leading-none">{c.prenom} {c.nom}</div>
                <div className="font-cond text-[10px] tracking-wider uppercase text-orange mt-1">
                  {c.type === "SOCIETE" ? c.societe ?? "Société" : "Particulier"}
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-gris-clair font-light">
              {c.email && <div>{c.email}</div>}
              {c.telephone && <div>{c.telephone}</div>}
              {c.permisExpire && <div className="text-gris text-xs font-cond">Permis valide jusqu'au {dateFr(c.permisExpire)}</div>}
            </div>
            <div className="mt-4 pt-3 border-t border-edge grid grid-cols-3 text-center font-cond">
              <div><div className="font-display text-xl">{c.reservations.length}</div><div className="text-[10px] uppercase text-gris tracking-wide">Résas</div></div>
              <div><div className="font-display text-xl">{c.rentals.length}</div><div className="text-[10px] uppercase text-gris tracking-wide">Locations</div></div>
              <div><div className="font-display text-xl">{c.sales.length}</div><div className="text-[10px] uppercase text-gris tracking-wide">Ventes</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
