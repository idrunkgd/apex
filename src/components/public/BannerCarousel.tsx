"use client";
import { useEffect, useState } from "react";
import { CarSilhouette } from "@/components/CarSilhouette";

export type Slide = { url: string | null; marque: string; modele: string };

export function BannerCarousel({
  slides,
  interval = 5000,
  align = "right",
}: {
  slides: Slide[];
  interval?: number;
  align?: "left" | "right";
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % slides.length), interval);
    return () => clearInterval(t);
  }, [slides.length, interval]);

  if (slides.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${i === idx ? "opacity-100" : "opacity-0"}`}
        >
          {s.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.url} alt={`${s.marque} ${s.modele}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(120%_100%_at_50%_40%,#1a1c21,#0a0b0d_70%)]">
              <CarSilhouette className={`w-[62%] ${align === "left" ? "-scale-x-100" : ""}`} />
            </div>
          )}
        </div>
      ))}

      {/* Nom de la voiture affichée + indicateurs */}
      <div className={`absolute bottom-5 z-[3] flex items-center gap-3 ${align === "left" ? "left-5" : "right-5"}`}>
        <span className="font-cond text-[11px] tracking-[2px] uppercase text-white/90 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-sm">
          {slides[idx].marque} <b className="text-orange">{slides[idx].modele}</b>
        </span>
      </div>
      {slides.length > 1 && (
        <div className={`absolute bottom-6 z-[3] flex gap-1.5 ${align === "left" ? "right-5" : "left-5"}`}>
          {slides.map((_, i) => (
            <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === idx ? "w-6 bg-orange" : "w-2 bg-white/30"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
