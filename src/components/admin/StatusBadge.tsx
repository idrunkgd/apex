import { label, VEHICLE_STATUS, RESERVATION_STATUS, STATUS_COLOR } from "@/lib/enums";

export function StatusBadge({ statut, kind = "vehicle" }: { statut: string; kind?: "vehicle" | "reservation" }) {
  const map = kind === "vehicle" ? VEHICLE_STATUS : RESERVATION_STATUS;
  const color = STATUS_COLOR[statut] ?? "text-gris border-edge";
  return (
    <span className={`inline-flex items-center font-cond text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-sm border ${color}`}>
      {label(map as Record<string, string>, statut)}
    </span>
  );
}
