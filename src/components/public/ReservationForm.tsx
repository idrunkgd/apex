"use client";
import { useActionState } from "react";
import { createReservation, type FormState } from "@/lib/actions/public";

const field = "w-full bg-carbone border border-edge rounded-sm px-4 py-3 font-sans text-sm text-white placeholder:text-gris focus:border-orange outline-none transition-colors";
const lbl = "font-cond text-[11px] tracking-[2px] uppercase text-gris mb-1.5 block";

export function ReservationForm({ vehicleId, prixJour, caution }: { vehicleId: string; prixJour: number | null; caution: number | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createReservation, {});

  if (state.ok) {
    return (
      <div className="border border-orange/40 bg-orange/5 rounded-md p-6 text-center">
        <div className="font-display text-3xl text-orange">DEMANDE ENVOYÉE</div>
        <p className="text-gris-clair font-light mt-2 text-sm">
          Votre demande <b className="text-white">{state.reference}</b> a bien été enregistrée. Notre équipe vous
          recontacte très vite pour confirmer.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Date de départ</label>
          <input type="date" name="dateDepart" className={field} required />
          {state.fieldErrors?.dateDepart && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.dateDepart}</p>}
        </div>
        <div>
          <label className={lbl}>Date de retour</label>
          <input type="date" name="dateRetour" className={field} required />
          {state.fieldErrors?.dateRetour && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.dateRetour}</p>}
        </div>
      </div>
      <div>
        <label className={lbl}>Nom complet</label>
        <input name="nom" placeholder="Votre nom" className={field} required />
        {state.fieldErrors?.nom && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.nom}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>Email</label>
          <input name="email" type="email" placeholder="vous@email.com" className={field} required />
          {state.fieldErrors?.email && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.email}</p>}
        </div>
        <div>
          <label className={lbl}>Téléphone</label>
          <input name="telephone" placeholder="+352 …" className={field} required />
          {state.fieldErrors?.telephone && <p className="text-red-400 text-xs mt-1">{state.fieldErrors.telephone}</p>}
        </div>
      </div>
      <div>
        <label className={lbl}>Message (optionnel)</label>
        <textarea name="message" rows={2} className={field} placeholder="Précisions, options souhaitées…" />
      </div>

      {caution ? (
        <p className="text-gris text-xs font-light">
          Caution : {new Intl.NumberFormat("fr-LU", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(caution)} · Âge min. 25 ans · Permis 3 ans.
        </p>
      ) : null}

      {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-50">
        {pending ? "Envoi…" : "Demander cette voiture →"}
      </button>
    </form>
  );
}
