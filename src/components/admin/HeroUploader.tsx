"use client";
import { useActionState, useTransition, useState } from "react";
import { uploadHeroImage, removeHeroImage, type SettingsState } from "@/lib/actions/settings";

export function HeroUploader({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(uploadHeroImage, {});
  const [busy, start] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="border border-edge rounded-lg bg-carbone p-6 max-w-3xl">
      <h2 className="font-cond tracking-[2px] uppercase text-sm mb-1">Image de la bannière d'accueil</h2>
      <p className="font-cond text-xs text-gris mb-5">
        Cette image s'affiche en fond du grand titre « Libérez la machine » sur la page d'accueil. Format paysage
        conseillé (au moins 1920×1080). Sans image, la silhouette dessinée est utilisée.
      </p>

      {/* Aperçu actuel / sélectionné */}
      <div className="relative aspect-[21/9] rounded-md overflow-hidden border border-edge bg-[radial-gradient(120%_100%_at_50%_40%,#1a1c21,#0a0b0d_70%)] mb-4">
        {preview || current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview ?? current!} alt="Bannière" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-cond text-sm text-gris uppercase tracking-wide">
            Aucune image — silhouette par défaut
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent pointer-events-none" />
        <span className="absolute bottom-3 left-4 font-display text-2xl text-white">LIBÉREZ LA <span className="text-orange">MACHINE.</span></span>
      </div>

      <form action={action} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="hero"
          accept="image/*"
          onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }}
          className="block text-sm text-gris-clair file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:font-cond file:text-xs file:uppercase file:tracking-wide file:bg-orange file:text-black hover:file:bg-orange-clair cursor-pointer"
        />
        <button type="submit" disabled={pending} className="btn-primary text-xs py-2.5 disabled:opacity-50">
          {pending ? "Envoi…" : "Enregistrer la bannière"}
        </button>
        {current && (
          <button
            type="button"
            disabled={busy}
            onClick={() => start(() => removeHeroImage())}
            className="font-cond text-xs tracking-wide uppercase px-4 py-2.5 rounded-sm border border-edge text-gris hover:border-red-400 hover:text-red-400 transition-colors"
          >
            Retirer
          </button>
        )}
      </form>

      {state.error && <p className="text-red-400 text-sm mt-3">{state.error}</p>}
      {state.ok && <p className="text-emerald-400 text-sm mt-3">Bannière mise à jour. Rechargez la page d'accueil pour la voir.</p>}
    </div>
  );
}
