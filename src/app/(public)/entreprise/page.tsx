import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/public/Counter";

export default function EntreprisePage() {
  return (
    <section className="pt-32 pb-24 px-5 md:px-16">
      <div className="eyebrow">L'entreprise</div>
      <h1 className="font-display text-[clamp(48px,10vw,150px)] leading-[.85] mt-3 max-w-5xl">
        LA PASSION<br />COMME <span className="text-orange">MOTEUR.</span>
      </h1>
      <p className="text-gris-clair font-light text-lg max-w-2xl mt-8 leading-relaxed">
        Zenith Luxury Experience réunit deux métiers autour d'une même obsession : l'excellence automobile. Nous sélectionnons,
        préparons et proposons des véhicules d'exception à l'achat comme à la location. Chaque voiture est
        choisie pour son caractère, vérifiée dans le détail et présentée comme elle le mérite.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 border-y border-edge py-12">
        {[
          { to: 120, s: "+", l: "Véhicules livrés" },
          { to: 40, s: "+", l: "Modèles de prestige" },
          { to: 15, s: "", l: "Marques d'exception" },
          { to: 98, s: "%", l: "Clients satisfaits" },
        ].map((c, i) => (
          <div key={c.l} className={`text-center ${i % 4 !== 0 ? "md:border-l border-edge" : ""}`}>
            <Counter to={c.to} suffix={c.s} className="font-display text-6xl [&_span]:text-orange" />
            <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris mt-2">{c.l}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-20">
        <Reveal className="border border-edge rounded-lg p-8 bg-carbone">
          <div className="font-display text-4xl mb-3">ACHAT & REVENTE</div>
          <p className="text-gris-clair font-light leading-relaxed">
            Nous acquérons des véhicules premium, sportifs et de collection, les préparons avec exigence et les
            proposons à la vente avec un historique transparent et un accompagnement complet.
          </p>
          <Link href="/vente" className="btn-ghost mt-6">Voitures à vendre →</Link>
        </Reveal>
        <Reveal className="border border-edge rounded-lg p-8 bg-carbone" delay={120}>
          <div className="font-display text-4xl mb-3">LOCATION</div>
          <p className="text-gris-clair font-light leading-relaxed">
            Vivez l'expérience d'une supercar le temps d'un jour, d'un week-end ou plus. Livraison, caution
            digitale et état des lieux photo pour une tranquillité totale.
          </p>
          <Link href="/location" className="btn-primary mt-6">Louer l'expérience →</Link>
        </Reveal>
      </div>
    </section>
  );
}
