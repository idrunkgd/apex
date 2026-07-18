"use client";
import { useState } from "react";
import { ReservationForm } from "@/components/public/ReservationForm";
import { ContactForm } from "@/components/public/ContactForm";
import { euro } from "@/lib/format";

export function VehiclePanel({
  vehicleId,
  prixJour,
  prixAffiche,
  caution,
  canRent,
  canSell,
  initial,
}: {
  vehicleId: string;
  prixJour: number | null;
  prixAffiche: number | null;
  caution: number | null;
  canRent: boolean;
  canSell: boolean;
  initial: "location" | "vente";
}) {
  const both = canRent && canSell;
  const only: "location" | "vente" | null = canRent && !canSell ? "location" : canSell && !canRent ? "vente" : null;
  const [tab, setTab] = useState<"location" | "vente">(only ?? initial);
  const active = only ?? tab;

  const tabBtn = (t: "location" | "vente", labelText: string) => (
    <button
      onClick={() => setTab(t)}
      className={`flex-1 font-cond text-xs tracking-[2px] uppercase py-2.5 transition-colors ${
        active === t ? "bg-orange text-black" : "text-gris-clair hover:text-white"
      }`}
    >
      {labelText}
    </button>
  );

  return (
    <div className="border border-edge rounded-lg bg-carbone p-6">
      {both && (
        <div className="flex border border-edge rounded-sm overflow-hidden mb-6">
          {tabBtn("location", "Location")}
          <span className="w-px bg-edge" />
          {tabBtn("vente", "Vente")}
        </div>
      )}

      <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris">
        {active === "location" ? "À partir de" : "Prix"}
      </div>
      <div className="font-display text-5xl text-orange mb-6">
        {active === "location" ? euro(prixJour, { perDay: true }) : euro(prixAffiche)}
      </div>

      {active === "location" ? (
        <ReservationForm vehicleId={vehicleId} prixJour={prixJour} caution={caution} />
      ) : (
        <div className="space-y-6">
          <div>
            <div className="font-cond text-sm tracking-[2px] uppercase text-white mb-3">Demander une information</div>
            <ContactForm vehicleId={vehicleId} type="INFO" submitLabel="Demander des informations →" />
          </div>
          <div className="border-t border-edge pt-6">
            <div className="font-cond text-sm tracking-[2px] uppercase text-white mb-3">Réserver un essai</div>
            <ContactForm vehicleId={vehicleId} type="ESSAI" submitLabel="Réserver un essai →" />
          </div>
        </div>
      )}
    </div>
  );
}
