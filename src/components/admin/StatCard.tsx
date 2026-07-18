export function StatCard({
  label,
  value,
  unit,
  accent,
  hint,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div className={`border rounded-lg p-5 bg-carbone ${accent ? "border-orange/40" : "border-edge"}`}>
      <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris">{label}</div>
      <div className={`font-display text-4xl mt-2 leading-none ${accent ? "text-orange" : "text-white"}`}>
        {value}
        {unit && <span className="text-lg text-gris ml-1">{unit}</span>}
      </div>
      {hint && <div className="font-cond text-[11px] text-gris mt-2">{hint}</div>}
    </div>
  );
}
