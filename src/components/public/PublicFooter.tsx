import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";

export function PublicFooter() {
  return (
    <footer className="bg-noir border-t border-edge px-5 md:px-16 py-14 relative z-10">
      <div className="flex flex-wrap justify-between gap-10">
        <div className="max-w-xs">
          <Wordmark size="lg" />
          <p className="mt-3 text-gris font-light text-sm leading-relaxed">
            Véhicules d'exception — achat, revente &amp; location. Luxembourg.
          </p>
        </div>
        <div className="flex gap-14 flex-wrap font-cond text-[13px] tracking-[1px]">
          <div className="space-y-2">
            <Link href="/vente" className="block text-gris hover:text-orange transition-colors">Vente</Link>
            <Link href="/location" className="block text-gris hover:text-orange transition-colors">Location</Link>
            <Link href="/#flotte" className="block text-gris hover:text-orange transition-colors">La flotte</Link>
          </div>
          <div className="space-y-2">
            <Link href="/contact" className="block text-gris hover:text-orange transition-colors">Contact</Link>
            <Link href="/entreprise" className="block text-gris hover:text-orange transition-colors">L'entreprise</Link>
            <Link href="/login" className="block text-gris hover:text-orange transition-colors">Espace pro</Link>
          </div>
          <div className="space-y-2 text-gris">
            <span className="block">Mentions légales</span>
            <span className="block">CGL / CGV</span>
            <span className="block">RGPD</span>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-edge text-gris text-xs flex justify-between flex-wrap gap-2">
        <span>© {new Date().getFullYear()} Zenith Luxury Experience — Luxembourg. TVA LU.</span>
        <span>Conçu pour être piloté.</span>
      </div>
    </footer>
  );
}
