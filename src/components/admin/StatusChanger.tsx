"use client";
import { useTransition } from "react";
import { changeVehicleStatus } from "@/lib/actions/admin";
import { VEHICLE_STATUS } from "@/lib/enums";

export function StatusChanger({ id, current }: { id: string; current: string }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) => start(() => changeVehicleStatus(id, e.target.value))}
      className="bg-noir border border-edge rounded-sm px-3 py-2 font-cond text-xs tracking-wide uppercase text-gris-clair focus:border-orange outline-none disabled:opacity-50"
    >
      {Object.entries(VEHICLE_STATUS).map(([k, l]) => (
        <option key={k} value={k}>{l}</option>
      ))}
    </select>
  );
}
