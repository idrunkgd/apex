import Link from "next/link";
import { eq, ne, and, inArray, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { CarSilhouette } from "@/components/CarSilhouette";
import { CarCard } from "@/components/public/CarCard";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/public/Counter";
import { BannerCarousel } from "@/components/public/BannerCarousel";
import { euro, num, coverOf } from "@/lib/format";
import { heroImageUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const heroBg = heroImageUrl();
  const featured = await db.query.vehicles.findMany({
    where: eq(vehicles.vedette, true),
    orderBy: [desc(vehicles.updatedAt)],
    limit: 1,
    with: { photos: true },
  });
  const hero = featured[0];
  const heroCover = hero ? coverOf(hero.photos) : null;
  const fleet = await db.query.vehicles.findMany({
    where: ne(vehicles.statut, "VENDU"),
    limit: 6,
    with: { photos: true },
  });

  const locCars = await db.query.vehicles.findMany({
    where: and(inArray(vehicles.destination, ["LOCATION", "LES_DEUX"]), inArray(vehicles.statut, ["DISPONIBLE", "A_LOUER", "LOUE", "RESERVE"])),
    with: { photos: true },
    limit: 8,
  });
  const venteCars = await db.query.vehicles.findMany({
    where: and(inArray(vehicles.destination, ["VENTE", "LES_DEUX"]), inArray(vehicles.statut, ["DISPONIBLE", "A_VENDRE"])),
    with: { photos: true },
    limit: 8,
  });
  const locSlides = locCars.map((c) => ({ url: coverOf(c.photos), marque: c.marque, modele: c.modele }));
  const venteSlides = venteCars.map((c) => ({ url: coverOf(c.photos), marque: c.marque, modele: c.modele }));

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative h-screen min-h-[640px] flex flex-col justify-center px-5 md:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {heroBg ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/55 to-noir/40" />
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[70vh] bg-[radial-gradient(closest-side,rgba(255,90,0,.18),transparent_70%)] blur-lg" />
            </>
          ) : (
            <>
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[70vh] bg-[radial-gradient(closest-side,rgba(255,90,0,.28),rgba(255,90,0,.05)_45%,transparent_70%)] blur-lg" />
              <div className="absolute bottom-0 left-0 w-full h-[38%] bg-gradient-to-t from-white/[.03] to-transparent border-t border-white/5" />
            </>
          )}
        </div>
        {!heroBg && <CarSilhouette className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[min(1100px,92vw)] -z-10 drop-shadow-2xl" />}

        <div className="max-w-5xl">
          <Reveal className="eyebrow">Véhicules d'exception · Luxembourg</Reveal>
          <h1 className="font-display text-[clamp(64px,13vw,190px)] leading-[.92] tracking-[2px] mt-7 pt-1">
            LIBÉREZ<br />
            LA <span className="text-orange" style={{ textShadow: "0 0 40px rgba(255,90,0,.55)" }}>MACHINE.</span>
          </h1>
          <Reveal delay={150}>
            <p className="mt-6 max-w-xl text-gris-clair text-[clamp(15px,1.5vw,18px)] font-light leading-relaxed">
              Achat, revente et location de supercars et de voitures de prestige. La performance n'a pas de
              limite — votre prochain départ commence ici.
            </p>
          </Reveal>
          <Reveal delay={280} className="flex gap-4 mt-9 flex-wrap">
            <Link href="/location" className="btn-primary">Louer l'expérience <span>→</span></Link>
            <Link href="/vente" className="btn-ghost">Voitures à vendre <span>→</span></Link>
          </Reveal>
        </div>

        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 font-cond text-[11px] tracking-[3px] uppercase text-gris flex flex-col items-center gap-2.5">
          <span className="w-px h-11 bg-gradient-to-b from-orange to-transparent animate-drop" />
          Scroll
        </div>
      </section>

      {/* ============================ MARQUEE ============================ */}
      <div className="border-y border-edge py-4 overflow-hidden bg-carbone whitespace-nowrap">
        <div className="inline-block animate-marquee font-display text-2xl tracking-[4px] text-[#3a3d44]">
          {Array(2).fill(0).map((_, i) => (
            <span key={i}>
              {["PORSCHE 911 GT3", "LAMBORGHINI HURACÁN", "FERRARI 296 GTB", "McLAREN 750S", "MERCEDES-AMG GT", "AUDI RS6", "BMW M4", "TAYCAN TURBO S"].map((t) => (
                <span key={t} className="mx-7"><span className="text-orange">/</span> {t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ============================ FEATURED (bannière plein cadre) ============================ */}
      {hero && (
        <section className="relative w-full min-h-[88vh] flex items-end overflow-hidden">
          {/* Fond : photo de la voiture en vedette (ou silhouette) */}
          {heroCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroCover} alt={`${hero.marque} ${hero.modele}`} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,#1b1d22,#080909_70%)]">
              <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[70%] h-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(255,90,0,.4),transparent_70%)] opacity-40 blur-lg" />
              <CarSilhouette className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[min(1100px,88vw)]" />
            </div>
          )}

          {/* Voiles pour la lisibilité des infos par-dessus la photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/45 to-noir/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/25 to-transparent" />

          {/* Badge + lien collection */}
          <span className="absolute top-24 left-5 md:left-16 z-10 font-cond text-[11px] tracking-[2px] uppercase px-3 py-1.5 border border-orange text-orange rounded-sm bg-black/30 backdrop-blur-sm">
            {hero.prixJour ? "À louer" : "À vendre"}
          </span>
          <Link href="/location" className="absolute top-24 right-5 md:right-16 z-10 hidden sm:inline-flex btn-ghost text-xs">
            Voir la collection →
          </Link>

          {/* Infos superposées */}
          <div className="relative z-10 w-full px-5 md:px-16 pb-16 pt-40">
            <Reveal className="eyebrow">En vedette · La pièce maîtresse</Reveal>
            <Reveal className="font-cond tracking-[4px] uppercase text-gris-clair text-sm mt-4">{hero.marque}</Reveal>
            <Reveal><h2 className="font-display text-[clamp(56px,11vw,150px)] leading-[.82]">{hero.modele}</h2></Reveal>

            <div className="flex flex-wrap items-end gap-x-12 gap-y-6 mt-8">
              <div className="flex gap-10">
                {[
                  { v: hero.puissanceCh, u: "CH", l: "Puissance", d: 0 },
                  { v: hero.accel0100 ?? 0, u: "SEC", l: "0 — 100", d: 1 },
                  { v: hero.vitesseMax ?? 0, u: "KM/H", l: "Vitesse max", d: 0 },
                ].map((st) => (
                  <Reveal key={st.l}>
                    <div className="font-display text-[clamp(30px,4vw,52px)] leading-none">
                      <Counter to={st.v} decimals={st.d} />
                      <small className="text-[.4em] text-orange ml-1 tracking-wide">{st.u}</small>
                    </div>
                    <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris mt-2">{st.l}</div>
                  </Reveal>
                ))}
              </div>

              <Reveal className="ml-auto flex items-center gap-6">
                <div>
                  <div className="font-cond text-gris text-[11px] tracking-[2px] uppercase">{hero.prixJour ? "À partir de" : "Prix"}</div>
                  <div className="font-display text-4xl text-orange">
                    {hero.prixJour ? euro(hero.prixJour, { perDay: true }) : euro(hero.prixAffiche)}
                  </div>
                </div>
                <Link href={`/vehicule/${hero.slug}?mode=${hero.prixJour ? "location" : "vente"}`} className="btn-primary">Découvrir →</Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ============================ PERFORMANCE NUMBERS ============================ */}
      <section className="px-5 md:px-16 py-24 bg-gradient-to-b from-noir to-carbone border-t border-edge">
        <Reveal className="eyebrow">Les chiffres parlent</Reveal>
        <Reveal><h2 className="font-display text-[clamp(40px,6vw,86px)] mt-3.5">LA PERFORMANCE EN CHIFFRES</h2></Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12">
          {[
            { to: 650, s: "CH", cap: "Puissance max", d: 0 },
            { to: 2.9, s: "SEC", cap: "0 — 100 km/h", d: 1 },
            { to: 330, s: "KM/H", cap: "Vitesse de pointe", d: 0 },
            { to: 24, s: "/7", cap: "Conciergerie", d: 0 },
          ].map((c, i) => (
            <div key={c.cap} className={`text-center py-8 ${i % 4 !== 0 ? "md:border-l border-edge" : ""}`}>
              <Counter
                to={c.to}
                decimals={c.d}
                suffix={c.s}
                className="font-display text-[clamp(58px,8vw,110px)] leading-[.9] bg-gradient-to-b from-[#e9ecf2] via-[#9aa0ab] to-[#e9ecf2] bg-clip-text text-transparent [&_span]:text-orange"
              />
              <div className="font-cond text-xs tracking-[3px] uppercase text-gris mt-2.5">{c.cap}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ SPLIT LOCATION / VENTE ============================ */}
      <section className="px-5 md:px-16 py-24 space-y-9">
        <Reveal className="relative min-h-[60vh] rounded-lg overflow-hidden border border-edge flex items-end bg-[linear-gradient(180deg,#0e0f13,#060607)]">
          <BannerCarousel slides={locSlides} align="right" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir/85 via-noir/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_80%_20%,rgba(255,90,0,.16),transparent_55%)]" />
          <div className="relative z-[2] p-7 md:p-14 max-w-xl">
            <span className="eyebrow">Location</span>
            <h3 className="font-display text-[clamp(38px,5.5vw,76px)] leading-[.92] my-4">
              PAS BESOIN DE LA POSSÉDER POUR LA VIVRE.
            </h3>
            <p className="text-gris-clair font-light leading-relaxed max-w-md mb-7">
              Supercars et véhicules de prestige à la journée, au week-end ou à la semaine. Livraison, caution
              digitale, état des lieux photo — tout est fluide.
            </p>
            <Link href="/location" className="btn-primary">Louer l'expérience →</Link>
          </div>
        </Reveal>

        <Reveal className="relative min-h-[60vh] rounded-lg overflow-hidden border border-edge flex items-end justify-end text-right bg-[linear-gradient(180deg,#0e0f13,#060607)]">
          <BannerCarousel slides={venteSlides} align="left" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-l from-noir/85 via-noir/25 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_20%,rgba(120,140,255,.14),transparent_55%)]" />
          <div className="relative z-[2] p-7 md:p-14 max-w-xl ml-auto">
            <span className="eyebrow">Vente</span>
            <h3 className="font-display text-[clamp(38px,5.5vw,76px)] leading-[.92] my-4">
              CERTAINES VOITURES MÉRITENT D'ÊTRE À VOUS.
            </h3>
            <p className="text-gris-clair font-light leading-relaxed max-w-md mb-7 ml-auto">
              Une sélection rare de véhicules premium, sportifs et de collection. Historique vérifié,
              préparation d'exception, accompagnement complet.
            </p>
            <Link href="/vente" className="btn-ghost">Voitures à vendre →</Link>
          </div>
        </Reveal>
      </section>

      {/* ============================ FLEET ============================ */}
      <section id="flotte" className="py-10 pb-24">
        <div className="flex justify-between items-end gap-5 mb-12 px-5 md:px-16 flex-wrap">
          <div>
            <Reveal className="eyebrow">Disponibles maintenant</Reveal>
            <Reveal><h2 className="font-display text-[clamp(40px,6vw,86px)] leading-[.9] mt-3">LA FLOTTE</h2></Reveal>
          </div>
          <Reveal><Link href="/location" className="btn-ghost">Tout explorer →</Link></Reveal>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 px-5 md:px-16">
          {fleet.map((v) => (
            <Reveal key={v.id}>
              <CarCard v={v} mode={v.prixJour ? "location" : "vente"} coverUrl={coverOf(v.photos)} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="relative py-32 px-5 md:px-16 text-center overflow-hidden border-t border-edge">
        <div className="absolute left-1/2 -bottom-1/3 -translate-x-1/2 w-[90vw] h-[70vh] bg-[radial-gradient(closest-side,rgba(255,90,0,.2),transparent_70%)] blur-2xl" />
        <Reveal className="eyebrow justify-center">Prêt à prendre le volant ?</Reveal>
        <Reveal>
          <h2 className="font-display text-[clamp(52px,11vw,150px)] leading-[.92] mt-4">
            VOTRE PROCHAIN<br />
            DÉPART <span className="text-orange" style={{ textShadow: "0 0 50px rgba(255,90,0,.55)" }}>COMMENCE ICI.</span>
          </h2>
        </Reveal>
        <Reveal className="mt-10">
          <Link href="/contact" className="btn-primary">Nous contacter →</Link>
        </Reveal>
      </section>
    </>
  );
}
