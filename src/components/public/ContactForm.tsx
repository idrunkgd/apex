"use client";
import { useActionState } from "react";
import { createLead, type FormState } from "@/lib/actions/public";

const field = "w-full bg-carbone border border-edge rounded-sm px-4 py-3 font-sans text-sm text-white placeholder:text-gris focus:border-orange outline-none transition-colors";
const lbl = "font-cond text-[11px] tracking-[2px] uppercase text-gris mb-1.5 block";

export function ContactForm({
  vehicleId,
  type = "CONTACT",
  submitLabel = "Envoyer →",
}: {
  vehicleId?: string;
  type?: "INFO" | "ESSAI" | "CONTACT";
  submitLabel?: string;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(createLead, {});

  if (state.ok) {
    return (
      <div className="border border-orange/40 bg-orange/5 rounded-md p-6 text-center">
        <div className="font-display text-3xl text-orange">MESSAGE ENVOYÉ</div>
        <p className="text-gris-clair font-light mt-2 text-sm">Merci — notre équipe vous recontacte rapidement.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}
      <input type="hidden" name="type" value={type} />
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
          <input name="telephone" placeholder="+352 …" className={field} />
        </div>
      </div>
      <div>
        <label className={lbl}>Message</label>
        <textarea name="message" rows={3} className={field} placeholder="Votre message…" />
      </div>
      {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-50">
        {pending ? "Envoi…" : submitLabel}
      </button>
    </form>
  );
}
