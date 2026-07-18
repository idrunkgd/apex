import { and, eq, inArray, asc, desc, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { CarCard } from "@/components/public/CarCard";
import { VehicleFilters } from "@/components/public/VehicleFilters";
import { Reveal } from "@/components/Reveal";
import { coverOf } from "@/lib/format";

type Search = { [k: string]: string | string[] | undefined };

export async function Catalog({
  mode,
  searchParams,
  title,
  subtitle,
}: {
  mode: "vente" | "location";
  searchParams: Search;
  title: string;
  subtitle: string;
}) {
  const s = (k: string) => (typeof searchParams[k] === "string" ? (searchParams[k] as string) : undefined);

  const conds: SQL[] = [];
  // destination selon le mode
  conds.push(inArray(vehicles.destination, mode === "location" ? ["LOCATION", "LES_DEUX"] : ["VENTE", "LES_DEUX"]));
  if (mode === "location") conds.push(inArray(vehicles.statut, ["DISPONIBLE", "A_LOUER", "LOUE", "RESERVE"]));
  else conds.push(inArray(vehicles.statut, ["DISPONIBLE", "A_VENDRE"]));

  if (s("marque")) conds.push(eq(vehicles.marque, s("marque")!));
  if (s("carburant")) conds.push(eq(vehicles.carburant, s("carburant")!));
  if (s("carrosserie")) conds.push(eq(vehicles.carrosserie, s("carrosserie")!));

  const priceCol = mode === "location" ? vehicles.prixJour : vehicles.prixAffiche;
  let order;
  switch (s("sort")) {
    case "prix-asc": order = asc(priceCol); break;
    case "prix-desc": order = desc(priceCol); break;
    case "puissance": order = desc(vehicles.puissanceCh); break;
    case "recent": order = desc(vehicles.annee); break;
    default: order = desc(vehicles.vedette);
  }

  const list = await db.query.vehicles.findMany({
    where: and(...conds),
    orderBy: order,
    with: { photos: true },
  });

  const allMarques = await db.select({ m: vehicles.marque }).from(vehicles);
  const marques = [...new Set(allMarques.map((r) => r.m))].sort();

  return (
    <section className="pt-32 pb-24 px-5 md:px-16 min-h-screen">
      <div className="eyebrow">{mode === "location" ? "Location" : "Vente"}</div>
      <h1 className="font-display text-[clamp(44px,8vw,120px)] leading-[.9] mt-3">{title}</h1>
      <p className="text-gris-clair font-light max-w-xl mt-4 mb-10">{subtitle}</p>

      <div className="flex justify-between items-center gap-4 mb-10 flex-wrap border-y border-edge py-5">
        <VehicleFilters marques={marques} mode={mode} />
        <span className="font-cond text-sm tracking-wide text-gris uppercase">
          {list.length} véhicule{list.length > 1 ? "s" : ""}
        </span>
      </div>

      {list.length === 0 ? (
        <div className="py-32 text-center">
          <div className="font-display text-5xl text-gris">AUCUN VÉHICULE</div>
          <p className="text-gris font-light mt-3">Aucun résultat pour ces critères. Essayez d'élargir votre recherche.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((v) => (
            <Reveal key={v.id}>
              <CarCard v={v} mode={mode} coverUrl={coverOf(v.photos)} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
