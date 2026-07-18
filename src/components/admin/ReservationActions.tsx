"use client";
import { useTransition } from "react";
import { setReservationStatus, convertReservationToRental } from "@/lib/actions/admin";

export function ReservationActions({ id, statut, hasRental }: { id: string; statut: string; hasRental?: boolean }) {
  const [pending, start] = useTransition();
  const closed = ["TERMINEE", "ANNULEE"].includes(statut);
  // un contrat existe déjà -> plus de conversion possible
  const converted = hasRental ?? ["CONFIRMEE", "PAYEE", "EN_COURS", "REMISE", "RETOUR_ATTENDU", "TERMINEE"].includes(statut);

  const btn = "font-cond text-[11px] tracking-wide uppercase px-2.5 py-1.5 rounded-sm border transition-colors disabled:opacity-40";

  return (
    <div className="flex gap-2 justify-end">
      {statut === "DEMANDE" && (
        <button
          disabled={pending}
          onClick={() => start(() => setReservationStatus(id, "OPTION"))}
          className={`${btn} border-edge text-gris-clair hover:border-white hover:text-white`}
        >
          Mettre en option
        </button>
      )}
      {!converted && !closed && (
        <button
          disabled={pending}
          onClick={() => start(() => convertReservationToRental(id))}
          className={`${btn} border-orange text-orange hover:bg-orange hover:text-black`}
        >
          Confirmer → location
        </button>
      )}
      {!closed && (
        <button
          disabled={pending}
          onClick={() => start(() => setReservationStatus(id, "ANNULEE"))}
          className={`${btn} border-edge text-gris hover:border-red-400 hover:text-red-400`}
        >
          Annuler
        </button>
      )}
    </div>
  );
}
