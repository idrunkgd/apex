"use client";
import { useActionState, useState } from "react";
import { submitCheckIn, type RentalFormState } from "@/lib/actions/rental";
import { CHECKIN_ITEMS, PHOTO_ANGLES } from "@/lib/checklist";
import { PhotoAngleInput } from "@/components/admin/PhotoAngleInput";
import { SignaturePad } from "@/components/admin/SignaturePad";

const field = "w-full bg-noir border border-edge rounded-sm px-3 py-2.5 text-sm text-white focus:border-orange outline-none";
const card = "border border-edge rounded-lg bg-carbone p-5";

export function CheckInForm({ rentalId, kmDepart }: { rentalId: string; kmDepart?: number | null }) {
  const action = submitCheckIn.bind(null, rentalId);
  const [state, formAction, pending] = useActionState<RentalFormState, FormData>(action, {});

  // tout décoché par défaut
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [photos, setPhotos] = useState<Record<string, boolean>>({});
  const [signed, setSigned] = useState(false);

  const checkedCount = CHECKIN_ITEMS.filter((it) => checked[it.key]).length;
  const photoCount = PHOTO_ANGLES.filter((a) => photos[a.key]).length;
  const allChecked = checkedCount === CHECKIN_ITEMS.length;
  const allPhotos = photoCount === PHOTO_ANGLES.length;
  const ready = allChecked && allPhotos && signed;

  const missingChecks = CHECKIN_ITEMS.filter((it) => !checked[it.key]).map((it) => it.label);
  const missingPhotos = PHOTO_ANGLES.filter((a) => !photos[a.key]).map((a) => a.label);

  return (
    <form action={formAction} className="space-y-5 max-w-3xl">
      <div className={card}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange">Contrôles avant remise</h3>
          <span className={`font-cond text-xs tracking-wide ${allChecked ? "text-emerald-400" : "text-gris"}`}>{checkedCount}/{CHECKIN_ITEMS.length}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {CHECKIN_ITEMS.map((it) => (
            <label key={it.key} className="flex items-center gap-3 py-2 px-3 rounded-sm border border-edge cursor-pointer hover:border-orange/50 transition-colors">
              <input
                type="checkbox"
                name={`chk_${it.key}`}
                checked={!!checked[it.key]}
                onChange={(e) => setChecked((c) => ({ ...c, [it.key]: e.target.checked }))}
                className="peer sr-only"
              />
              <span className="w-5 h-5 rounded-sm border border-gris flex items-center justify-center peer-checked:bg-orange peer-checked:border-orange text-black text-xs font-bold transition-colors">✓</span>
              <span className="font-cond text-sm text-gris-clair">{it.label}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setChecked(Object.fromEntries(CHECKIN_ITEMS.map((it) => [it.key, true])))}
          className="mt-3 font-cond text-[11px] tracking-wide uppercase text-gris hover:text-orange transition-colors"
        >
          Tout cocher
        </button>
      </div>

      <div className={card}>
        <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Relevés</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Kilométrage au départ</label>
            <input name="km" type="number" defaultValue={kmDepart ?? ""} placeholder="Ex : 6800" className={field} />
          </div>
          <div>
            <label className="font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Carburant / charge (%)</label>
            <input name="carburant" type="number" min={0} max={100} defaultValue={100} className={field} />
          </div>
        </div>
      </div>

      <div className={card}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange">Photos de l'état des lieux</h3>
          <span className={`font-cond text-xs tracking-wide ${allPhotos ? "text-emerald-400" : "text-gris"}`}>{photoCount}/{PHOTO_ANGLES.length}</span>
        </div>
        <p className="font-cond text-xs text-gris mb-4">Les {PHOTO_ANGLES.length} angles sont obligatoires. Touchez une case pour prendre ou choisir une photo.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {PHOTO_ANGLES.map((a) => (
            <PhotoAngleInput key={a.key} angleKey={a.key} label={a.label} onFileChange={(k, has) => setPhotos((p) => ({ ...p, [k]: has }))} />
          ))}
        </div>
      </div>

      <div className={card}>
        <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Signature du client <span className="text-red-400">*</span></h3>
        <SignaturePad name="signature" onChange={setSigned} />
      </div>

      {/* Récap de ce qui manque */}
      {!ready && (
        <div className="border border-amber-400/30 bg-amber-400/5 rounded-md px-4 py-3">
          <p className="font-cond text-xs tracking-wide uppercase text-amber-400 mb-1.5">À compléter avant de valider</p>
          <ul className="text-sm text-gris-clair font-light space-y-0.5">
            {!allChecked && <li>• Contrôles restants : {missingChecks.join(", ")}</li>}
            {!allPhotos && <li>• Photos manquantes : {missingPhotos.join(", ")}</li>}
            {!signed && <li>• Signature du client manquante</li>}
          </ul>
        </div>
      )}

      {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}

      <button
        type="submit"
        disabled={pending || !ready}
        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed sticky bottom-4"
      >
        {pending ? "Enregistrement…" : ready ? "Valider la remise & démarrer la location →" : "Complétez la checklist et les photos"}
      </button>
    </form>
  );
}
