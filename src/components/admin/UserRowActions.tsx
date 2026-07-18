"use client";
import { useState, useTransition } from "react";
import { setUserActive, resetUserPassword } from "@/lib/actions/users";

export function UserRowActions({ id, actif, isSelf }: { id: string; actif: boolean; isSelf: boolean }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");

  const btn = "font-cond text-[11px] tracking-wide uppercase px-2.5 py-1.5 rounded-sm border transition-colors disabled:opacity-40";

  return (
    <div className="flex items-center gap-2 justify-end">
      {open ? (
        <span className="flex items-center gap-1.5">
          <input
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="nouveau mot de passe"
            className="bg-noir border border-edge rounded-sm px-2 py-1 text-xs text-white w-40 focus:border-orange outline-none"
          />
          <button
            disabled={pending || pw.length < 6}
            onClick={() => start(async () => { await resetUserPassword(id, pw); setPw(""); setOpen(false); })}
            className={`${btn} border-orange text-orange hover:bg-orange hover:text-black`}
          >
            OK
          </button>
          <button onClick={() => { setOpen(false); setPw(""); }} className={`${btn} border-edge text-gris`}>Annuler</button>
        </span>
      ) : (
        <button onClick={() => setOpen(true)} className={`${btn} border-edge text-gris-clair hover:border-white hover:text-white`}>
          Mot de passe
        </button>
      )}

      {!isSelf && (
        <button
          disabled={pending}
          onClick={() => start(() => setUserActive(id, !actif))}
          className={`${btn} ${actif ? "border-edge text-gris hover:border-red-400 hover:text-red-400" : "border-emerald-400/60 text-emerald-400 hover:bg-emerald-400 hover:text-black"}`}
        >
          {actif ? "Désactiver" : "Activer"}
        </button>
      )}
    </div>
  );
}
