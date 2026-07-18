"use client";
import { useActionState } from "react";
import { createUser, type UserFormState } from "@/lib/actions/users";
import { ROLE_OPTIONS } from "@/lib/enums";

const field = "w-full bg-noir border border-edge rounded-sm px-3 py-2.5 text-sm text-white placeholder:text-gris focus:border-orange outline-none";
const lbl = "font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block";

export function UserCreateForm() {
  const [state, action, pending] = useActionState<UserFormState, FormData>(createUser, {});
  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <div className="border border-edge rounded-lg bg-carbone p-6">
      <h2 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">Nouveau compte</h2>
      <form action={action} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div>
          <label className={lbl}>Nom</label>
          <input name="nom" placeholder="Prénom Nom" className={field} />
          {err("nom") && <p className="text-red-400 text-xs mt-1">{err("nom")}</p>}
        </div>
        <div>
          <label className={lbl}>Email</label>
          <input name="email" type="email" placeholder="employe@zenith.lu" className={field} />
          {err("email") && <p className="text-red-400 text-xs mt-1">{err("email")}</p>}
        </div>
        <div>
          <label className={lbl}>Mot de passe</label>
          <input name="password" type="text" placeholder="min. 6 caractères" className={field} />
          {err("password") && <p className="text-red-400 text-xs mt-1">{err("password")}</p>}
        </div>
        <div>
          <label className={lbl}>Rôle</label>
          <select name="role" defaultValue="EMPLOYE" className={field}>
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
          <button type="submit" disabled={pending} className="btn-primary text-xs py-2.5 disabled:opacity-50">
            {pending ? "Création…" : "Créer le compte"}
          </button>
          {state.error && <span className="text-red-400 text-sm">{state.error}</span>}
          {state.ok && <span className="text-emerald-400 text-sm">Compte créé.</span>}
        </div>
      </form>
    </div>
  );
}
