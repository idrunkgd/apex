"use client";
import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

const field = "w-full bg-carbone border border-edge rounded-sm px-4 py-3 font-sans text-sm text-white placeholder:text-gris focus:border-orange outline-none transition-colors";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, { error: "" } as { error?: string });

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="font-cond text-[11px] tracking-[2px] uppercase text-gris mb-1.5 block">Email</label>
        <input name="email" type="email" placeholder="admin@apex.lu" className={field} required defaultValue="admin@apex.lu" />
      </div>
      <div>
        <label className="font-cond text-[11px] tracking-[2px] uppercase text-gris mb-1.5 block">Mot de passe</label>
        <input name="password" type="password" placeholder="••••••••" className={field} required defaultValue="apex1234" />
      </div>
      {state?.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full justify-center disabled:opacity-50">
        {pending ? "Connexion…" : "Se connecter →"}
      </button>
    </form>
  );
}
