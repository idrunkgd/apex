"use client";
import { useActionState, useTransition, useRef } from "react";
import { uploadVehiclePhotos, deleteVehiclePhoto, setCoverPhoto } from "@/lib/actions/photos";

type Photo = { id: string; url: string; categorie: string; cover: boolean; ordre: number };

const CATS: [string, string][] = [
  ["EXTERIEUR", "Extérieur"],
  ["INTERIEUR", "Intérieur"],
  ["MOTEUR", "Moteur"],
  ["JANTES", "Jantes"],
  ["DETAIL", "Détail"],
];

export function PhotoManager({ vehicleId, photos }: { vehicleId: string; photos: Photo[] }) {
  const action = uploadVehiclePhotos.bind(null, vehicleId);
  const [state, formAction, pending] = useActionState<{ ok?: boolean; error?: string }, FormData>(action, {});
  const [busy, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const real = photos.filter((p) => p.url).sort((a, b) => a.ordre - b.ordre);

  return (
    <div className="border border-edge rounded-lg bg-carbone p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-cond tracking-[2px] uppercase text-sm">Photos ({real.length})</h2>
      </div>

      {/* Upload */}
      <form action={formAction} ref={formRef} className="flex flex-wrap items-end gap-3 mb-5 border border-edge rounded-md p-4 bg-noir/40">
        <div>
          <label className="font-cond text-[10px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Catégorie</label>
          <select name="categorie" className="bg-noir border border-edge rounded-sm px-3 py-2 font-cond text-sm text-gris-clair focus:border-orange outline-none">
            {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="font-cond text-[10px] tracking-[1.5px] uppercase text-gris mb-1.5 block">Images (JPEG, PNG, WebP · max 10 Mo)</label>
          <input
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="block w-full text-sm text-gris-clair file:mr-3 file:py-2 file:px-4 file:rounded-sm file:border-0 file:font-cond file:text-xs file:uppercase file:tracking-wide file:bg-orange file:text-black hover:file:bg-orange-clair cursor-pointer"
          />
        </div>
        <button type="submit" disabled={pending} className="btn-primary text-xs py-2.5 disabled:opacity-50">
          {pending ? "Envoi…" : "Ajouter"}
        </button>
      </form>
      {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2 mb-4">{state.error}</p>}
      {state.ok && <p className="text-emerald-400 text-sm mb-4">Photos ajoutées.</p>}

      {/* Grille */}
      {real.length === 0 ? (
        <p className="text-gris font-light text-sm">Aucune photo pour l'instant — les fiches affichent une silhouette en attendant.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {real.map((p) => (
            <div key={p.id} className="relative group rounded-md overflow-hidden border border-edge aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.categorie} className="w-full h-full object-cover" />
              {p.cover && (
                <span className="absolute top-2 left-2 font-cond text-[9px] tracking-wider uppercase px-2 py-0.5 rounded-sm bg-orange text-black">Couverture</span>
              )}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!p.cover && (
                  <button
                    disabled={busy}
                    onClick={() => start(() => setCoverPhoto(p.id))}
                    className="font-cond text-[10px] uppercase tracking-wide px-2.5 py-1.5 rounded-sm border border-orange text-orange hover:bg-orange hover:text-black transition-colors"
                  >
                    Couverture
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => start(() => deleteVehiclePhoto(p.id))}
                  className="font-cond text-[10px] uppercase tracking-wide px-2.5 py-1.5 rounded-sm border border-red-400/60 text-red-400 hover:bg-red-400 hover:text-black transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
