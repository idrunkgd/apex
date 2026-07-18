import Link from "next/link";
import { CarSilhouette } from "@/components/CarSilhouette";
import { euro, num } from "@/lib/format";
import { label, CARROSSERIE } from "@/lib/enums";

type Vehicle = {
  slug: string;
  marque: string;
  modele: string;
  statut: string;
  carrosserie: string;
  puissanceCh: number;
  accel0100: number | null;
  vitesseMax: number | null;
  prixAffiche: number | null;
  prixJour: number | null;
};

export function CarCard({ v, mode, coverUrl }: { v: Vehicle; mode: "vente" | "location"; coverUrl?: string | null }) {
  const dispo = v.statut === "DISPONIBLE" || v.statut === "A_LOUER" || v.statut === "A_VENDRE";
  return (
    <Link
      href={`/vehicule/${v.slug}?mode=${mode}`}
      className="group block border border-edge rounded-md overflow-hidden bg-carbone hover:border-orange transition-all duration-300 hover:-translate-y-1.5"
    >
      <div className="relative aspect-[16/10] bg-[radial-gradient(120%_100%_at_50%_30%,#1a1c21,#0a0b0d_70%)] overflow-hidden">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={`${v.marque} ${v.modele}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <>
            <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 w-[80%] h-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(255,90,0,.45),transparent_70%)] opacity-40 blur-md" />
            <CarSilhouette className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[82%] transition-transform duration-500 group-hover:scale-105" />
          </>
        )}
        <span
          className={`absolute top-3.5 right-3.5 font-cond text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm bg-black/50 border ${
            dispo ? "text-emerald-400 border-emerald-400/40" : "text-orange border-orange/40"
          }`}
        >
          {dispo ? "Disponible" : "Indisponible"}
        </span>
      </div>
      <div className="p-5">
        <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris">{v.marque}</div>
        <div className="font-display text-3xl leading-none mt-1 mb-1">{v.modele}</div>
        <div className="font-cond text-[11px] tracking-wide uppercase text-gris mb-4">
          {label(CARROSSERIE, v.carrosserie)}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-edge pt-3 font-cond text-xs text-gris-clair">
          <div><b className="text-white block font-display text-lg leading-none">{num(v.puissanceCh)}</b>CH</div>
          <div><b className="text-white block font-display text-lg leading-none">{v.accel0100 ?? "—"}</b>0-100</div>
          <div><b className="text-white block font-display text-lg leading-none">{num(v.vitesseMax)}</b>KM/H</div>
        </div>
        <div className="mt-4 pt-3 border-t border-edge flex items-baseline justify-between">
          <span className="font-cond text-[11px] tracking-wide uppercase text-gris">
            {mode === "location" ? "À partir de" : "Prix"}
          </span>
          <span className="font-display text-2xl text-orange">
            {mode === "location" ? euro(v.prixJour, { perDay: true }) : euro(v.prixAffiche)}
          </span>
        </div>
      </div>
    </Link>
  );
}
