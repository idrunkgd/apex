"use client";
import { useActionState, useState } from "react";
import { submitCheckOut, type RentalFormState } from "@/lib/actions/rental";
import { CHECKOUT_ITEMS, PHOTO_ANGLES } from "@/lib/checklist";
import { PhotoAngleInput } from "@/components/admin/PhotoAngleInput";
import { euro } from "@/lib/format";

const field = "w-full bg-noir border border-edge rounded-sm px-3 py-2.5 text-sm text-white focus:border-orange outline-none";
const card = "border border-edge rounded-lg bg-carbone p-5";
const FUEL = 4;

export function CheckOutForm({
  rentalId, kmDepart, carbDepart, kmInclus, prixKmSupp, prixJour, joursRetard,
}: {
  rentalId: string; kmDepart: number; carbDepart: number; kmInclus: number;
  prixKmSupp: number; prixJour: number; joursRetard: number;
}) {
  const action = submitCheckOut.bind(null, rentalId);
  const [state, formAction, pending] = useActionState<RentalFormState, FormData>(action, {});
  const [km, setKm] = useState<number>(kmDepart);
  const [carb, setCarb] = useState<number>(carbDepart);

  const kmSupp = Math.max(0, Math.max(0, km - kmDepart) - kmInclus);
  const fraisKm = Math.round(kmSupp * prixKmSupp);
  const fraisRetard = Math.round(joursRetard * prixJour);
  const fraisCarburant = Math.round(Math.max(0, carbDepart - carb) * FUEL);
  const total = fraisKm + fraisRetard + fraisCarburant;

  return (
    <form action={formAction} className="grid lg:grid-cols-[1.4fr_.9fr] gap-6 items-start">
      <div className="space-y-5">
        <div className={card}>
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Contrôles au retour</h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {CHECKOUT_ITEMS.map((it) => (
              <label key={it.key} className="flex items-center gap-3 py-2 px-3 rounded-sm border border-edge cursor-pointer hover:border-orange/50 transition-colors">
                <input type="checkbox" name={`chk_${it.key}`} defaultChecked className="peer sr-only" />
                <span className="w-5 h-5 rounded-sm border border-gris flex items-center justify-center peer-checked:bg-orange peer-checked:border-orange text-black text-xs font-bold transition-colors">✓</span>
                <span className="font-cond text-sm text-gris-clair">{it.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Relevés au retour</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Kilométrage retour</label>
              <input name="km" type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} className={field} />
              <p className="text-gris text-xs font-cond mt-1">Départ : {kmDepart.toLocaleString("fr-LU")} km · inclus : {kmInclus.toLocaleString("fr-LU")} km</p>
            </div>
            <div>
              <label className="font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Carburant / charge (%)</label>
              <input name="carburant" type="number" min={0} max={100} value={carb} onChange={(e) => setCarb(Number(e.target.value))} className={field} />
              <p className="text-gris text-xs font-cond mt-1">Au départ : {carbDepart}%</p>
            </div>
          </div>
        </div>

        <div className={card}>
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-1">Photos de l'état des lieux</h3>
          <p className="font-cond text-xs text-gris mb-4">Touchez une case pour prendre ou choisir une photo.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {PHOTO_ANGLES.map((a) => <PhotoAngleInput key={a.key} angleKey={a.key} label={a.label} />)}
          </div>
        </div>

        <div className={card}>
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-3">Dommage constaté (optionnel)</h3>
          <textarea name="damage" rows={2} className={field} placeholder="Rayure portière avant droite, jante arrière…" />
        </div>
      </div>

      {/* Récapitulatif frais */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className={card}>
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Frais supplémentaires</h3>
          <Row label={`Km supplémentaires (${kmSupp.toLocaleString("fr-LU")} km)`} value={fraisKm} />
          <Row label={joursRetard > 0 ? `Retard (${joursRetard} j)` : "Retard"} value={fraisRetard} />
          <Row label={`Carburant manquant (${Math.max(0, carbDepart - carb)}%)`} value={fraisCarburant} />
          <div className="flex justify-between items-center border-t border-edge mt-3 pt-3">
            <span className="font-cond text-sm tracking-wide uppercase">Total</span>
            <span className="font-display text-3xl text-orange">{euro(total)}</span>
          </div>
          <p className="text-gris text-[11px] font-cond mt-2">Le total est recalculé et enregistré au moment de la validation.</p>
        </div>

        {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}

        <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-50">
          {pending ? "Clôture…" : "Valider le retour & clôturer →"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center py-1.5 text-sm">
      <span className="text-gris-clair font-light">{label}</span>
      <span className="font-cond">{euro(value)}</span>
    </div>
  );
}
