"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

const NAV = [
  { group: "Pilotage", items: [{ href: "/admin", label: "Dashboard", icon: "◈" }] },
  {
    group: "Flotte",
    items: [
      { href: "/admin/flotte", label: "Gestion de la flotte", icon: "▤" },
    ],
  },
  {
    group: "Location",
    items: [
      { href: "/admin/locations", label: "Locations", icon: "⇄" },
      { href: "/admin/planning", label: "Planning", icon: "▦" },
    ],
  },
  {
    group: "Commercial",
    items: [
      { href: "/admin/ventes", label: "Ventes & pipeline", icon: "€" },
      { href: "/admin/clients", label: "Clients", icon: "☺" },
    ],
  },
  {
    group: "Administration",
    items: [{ href: "/admin/parametres", label: "Paramètres", icon: "⚙" }],
  },
];

export function AdminSidebar({ user }: { user: { nom: string; role: string } }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-sm border border-edge bg-carbone flex items-center justify-center text-white"
        aria-label="Menu"
      >☰</button>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-carbone border-r border-edge flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Link href="/admin" className="font-display text-3xl tracking-[5px] flex items-center gap-2.5 px-6 py-6 border-b border-edge">
          <span className="w-2 h-2 bg-orange rounded-full shadow-glow" />APEX
          <span className="font-cond text-[9px] tracking-[2px] text-gris ml-auto mt-2">COCKPIT</span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV.map((g) => (
            <div key={g.group} className="mb-5">
              <div className="font-cond text-[10px] tracking-[2px] uppercase text-gris/60 px-3 mb-2">{g.group}</div>
              {g.items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm font-cond text-sm tracking-wide mb-0.5 transition-colors ${
                    active(it.href) ? "bg-orange/10 text-orange border-l-2 border-orange" : "text-gris-clair hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base opacity-70">{it.icon}</span>
                  {it.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-edge p-4">
          <div className="font-cond text-sm text-white">{user.nom}</div>
          <div className="font-cond text-[10px] tracking-[2px] uppercase text-orange mb-3">{user.role}</div>
          <form action={logoutAction}>
            <button className="w-full font-cond text-xs tracking-wide uppercase text-gris border border-edge rounded-sm py-2 hover:border-orange hover:text-orange transition-colors">
              Déconnexion
            </button>
          </form>
        </div>
      </aside>
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
