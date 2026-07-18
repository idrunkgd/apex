"use client";
import { useState } from "react";

export function PhotoAngleInput({
  angleKey,
  label,
  onFileChange,
}: {
  angleKey: string;
  label: string;
  onFileChange?: (key: string, hasFile: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <label className={`relative block aspect-[4/3] rounded-md border overflow-hidden cursor-pointer bg-noir/50 transition-colors ${preview ? "border-emerald-500/60" : "border-edge hover:border-orange"}`}>
      <input
        type="file"
        name={`photo_${angleKey}`}
        accept="image/*"
        capture="environment"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const f = e.target.files?.[0];
          setPreview(f ? URL.createObjectURL(f) : null);
          onFileChange?.(angleKey, !!f);
        }}
      />
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="w-full h-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gris">
          <span className="text-2xl leading-none">＋</span>
          <span className="font-cond text-[10px] tracking-wide uppercase">{label}</span>
        </span>
      )}
      {preview && (
        <span className="absolute bottom-1 left-1 font-cond text-[9px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-black/60 text-white">{label}</span>
      )}
    </label>
  );
}
