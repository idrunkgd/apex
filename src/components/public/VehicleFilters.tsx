"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function VehicleFilters({ marques, mode }: { marques: string[]; mode: "vente" | "location" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`${pathname}?${p.toString()}`);
  }

  const selectCls =
    "bg-carbone border border-edge rounded-sm px-3 py-2.5 font-cond text-sm text-gris-clair focus:border-orange outline-none";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select className={selectCls} value={params.get("marque") ?? ""} onChange={(e) => set("marque", e.target.value)}>
        <option value="">Toutes marques</option>
        {marques.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select className={selectCls} value={params.get("carburant") ?? ""} onChange={(e) => set("carburant", e.target.value)}>
        <option value="">Carburant</option>
        <option value="ESSENCE">Essence</option>
        <option value="DIESEL">Diesel</option>
        <option value="ELECTRIQUE">Électrique</option>
        <option value="HYBRIDE">Hybride</option>
      </select>

      <select className={selectCls} value={params.get("carrosserie") ?? ""} onChange={(e) => set("carrosserie", e.target.value)}>
        <option value="">Carrosserie</option>
        <option value="COUPE">Coupé</option>
        <option value="BERLINE">Berline</option>
        <option value="SUV">SUV</option>
        <option value="CABRIOLET">Cabriolet</option>
        <option value="BREAK">Break</option>
      </select>

      <select className={selectCls} value={params.get("sort") ?? ""} onChange={(e) => set("sort", e.target.value)}>
        <option value="">Tri : par défaut</option>
        <option value="prix-asc">Prix croissant</option>
        <option value="prix-desc">Prix décroissant</option>
        <option value="puissance">Puissance</option>
        <option value="recent">Plus récents</option>
      </select>

      {[...params.keys()].length > 0 && (
        <button
          onClick={() => router.push(pathname)}
          className="font-cond text-xs tracking-wide uppercase text-orange px-3 py-2.5 border border-orange/40 rounded-sm hover:bg-orange hover:text-black transition-all"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}
