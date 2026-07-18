"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/Wordmark";

const LINKS = [
  { href: "/vente", label: "Vente" },
  { href: "/location", label: "Location" },
  { href: "/#flotte", label: "La flotte" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav({ isAuthed = false }: { isAuthed?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-5 md:px-16 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-noir/90 backdrop-blur-lg border-b border-edge"
          : "py-5 bg-gradient-to-b from-noir/80 to-transparent"
      }`}
    >
      <Link href="/" className="flex items-center gap-2.5">
        <span className="w-2.5 h-2.5 bg-orange rounded-full shadow-glow" />
        <Wordmark size="md" />
      </Link>

      <nav className="hidden md:flex gap-8 font-cond text-[13px] tracking-[2px] uppercase text-gris-clair">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="speed-underline hover:text-white transition-colors">
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="hidden md:flex items-center gap-5">
        {isAuthed && (
          <Link href="/admin" className="font-cond text-[13px] tracking-[2px] uppercase text-gris-clair hover:text-orange transition-colors">
            Cockpit
          </Link>
        )}
        <Link
          href="/location"
          className="font-cond text-xs tracking-[2px] uppercase border border-orange text-white px-5 py-2.5 rounded-sm hover:bg-orange hover:text-black hover:shadow-glow transition-all"
        >
          Réserver
        </Link>
      </div>

      {/* Mobile */}
      <button
        aria-label="Menu"
        className="md:hidden flex flex-col gap-1.5"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="w-6 h-0.5 bg-white block" />
        <span className="w-6 h-0.5 bg-white block" />
        <span className="w-6 h-0.5 bg-white block" />
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full bg-noir/95 backdrop-blur-lg border-b border-edge flex flex-col p-6 gap-4 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-cond uppercase tracking-[2px] text-gris-clair">
              {l.label}
            </Link>
          ))}
          <Link href="/location" onClick={() => setOpen(false)} className="font-cond uppercase tracking-[2px] text-orange">
            Réserver
          </Link>
          {isAuthed && (
            <Link href="/admin" onClick={() => setOpen(false)} className="font-cond uppercase tracking-[2px] text-gris-clair">
              Cockpit
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
