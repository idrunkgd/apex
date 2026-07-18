import { notFound } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { vehicles } from "@/db/schema";
import { CarSilhouette } from "@/components/CarSilhouette";
import { Reveal } from "@/components/Reveal";
import { VehiclePanel } from "@/components/public/VehiclePanel";
import { euro, num, km as fmtKm, parseJson, coverOf } from "@/lib/format";
import { label, CARBURANT, CARROSSERIE, TRANSMISSION } from "@/lib/enums";

export const dynamic = "force-dynamic";

export default async function VehiclePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const v = await db.query.vehicles.findFirst({ where: eq(vehicles.slug, slug), with: { photos: true } });
  if (!v) notFound();

  const canRent = !!v.prixJour && v.destination !== "VENTE";
  const canSell = v.destination !== "LOCATION";
  // Onglet ouvert par défaut selon le contexte (d'où vient l'utilisateur).
  const initialTab: "location" | "vente" =
    sp.mode === "location" && canRent ? "location" : sp.mode === "vente" ? "vente" : canSell ? "vente" : "location";
  const equipements = parseJson<string[]>(v.equipements, []);
  const gallery = [...(v.photos ?? [])].filter((p) => p.url).sort((a, b) => a.ordre - b.ordre);
  const heroCover = coverOf(v.photos);

  const perf = [
    { l: "Puissance", v: num(v.puissanceCh), u: "CH" },
    { l: "0 — 100 km/h", v: v.accel0100 ?? "—", u: "SEC" },
    { l: "Vitesse max", v: num(v.vitesseMax), u: "KM/H" },
    { l: "Moteur", v: v.moteur ?? "—", u: "" },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex flex-col justify-end px-5 md:px-16 pb-16 pt-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_35%,#16181d,#050506_70%)]" />
        {heroCover ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroCover} alt={`${v.marque} ${v.modele}`} className="absolute inset-0 -z-10 w-full h-full object-cover" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noir via-noir/40 to-noir/60" />
          </>
        ) : (
          <>
            <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(255,90,0,.4),transparent_70%)] opacity-40 blur-xl -z-10" />
            <CarSilhouette className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[min(1050px,92vw)] -z-10 drop-shadow-2xl" />
          </>
        )}

        <Link href={initialTab === "location" ? "/location" : "/vente"} className="font-cond text-xs tracking-[2px] uppercase text-gris hover:text-orange transition-colors mb-6">
          ← Retour
        </Link>
        <div className="font-cond tracking-[5px] uppercase text-orange text-sm">{v.marque}</div>
        <h1 className="font-display text-[clamp(56px,12vw,170px)] leading-[.85]">{v.modele}</h1>
        {v.version && <div className="font-cond tracking-[3px] uppercase text-gris mt-2">{v.version} · {v.annee}</div>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 max-w-3xl">
          {perf.map((p) => (
            <div key={p.l} className="border-t border-edge pt-3">
              <div className="font-display text-[clamp(28px,4vw,50px)] leading-none">
                {p.v}<span className="text-[.4em] text-orange ml-1">{p.u}</span>
              </div>
              <div className="font-cond text-[11px] tracking-[2px] uppercase text-gris mt-1">{p.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="px-5 md:px-16 py-16">
        {gallery.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-4">
            {gallery.map((p, i) => (
              <Reveal
                key={p.id}
                className={`rounded-lg overflow-hidden border border-edge ${i % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`${v.marque} ${v.modele} — ${p.categorie}`} className="w-full h-full object-cover" />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            <Reveal className="md:col-span-2 aspect-[16/9] rounded-lg overflow-hidden bg-[radial-gradient(120%_100%_at_50%_40%,#1a1c21,#0a0b0d_70%)] border border-edge flex items-center justify-center">
              <CarSilhouette className="w-[75%]" />
            </Reveal>
            <Reveal className="aspect-[16/9] md:aspect-auto rounded-lg overflow-hidden bg-[radial-gradient(120%_100%_at_50%_40%,#17191e,#0a0b0d_70%)] border border-edge flex items-center justify-center">
              <CarSilhouette className="w-[85%] rotate-[8deg]" />
            </Reveal>
            <Reveal className="aspect-[4/3] rounded-lg overflow-hidden bg-[radial-gradient(120%_100%_at_50%_40%,#17191e,#0a0b0d_70%)] border border-edge flex items-center justify-center">
              <CarSilhouette className="w-[90%] -scale-x-100" />
            </Reveal>
            <Reveal className="md:col-span-2 aspect-[16/9] rounded-lg overflow-hidden bg-[radial-gradient(120%_100%_at_50%_40%,#1a1c21,#0a0b0d_70%)] border border-edge flex items-center justify-center">
              <CarSilhouette className="w-[70%]" />
            </Reveal>
          </div>
        )}
      </section>

      {/* CONTENT + PANEL */}
      <section className="px-5 md:px-16 py-16 grid lg:grid-cols-[1.4fr_.9fr] gap-14">
        <div>
          <div className="eyebrow">La machine</div>
          <h2 className="font-display text-5xl mt-3 mb-5">CARACTÈRE</h2>
          <p className="text-gris-clair font-light leading-relaxed text-lg max-w-2xl">{v.description}</p>

          <h3 className="font-display text-3xl mt-14 mb-6">FICHE TECHNIQUE</h3>
          <div className="grid sm:grid-cols-2 gap-x-10 gap-y-0">
            {[
              ["Année", v.annee],
              ["Kilométrage", fmtKm(v.kilometrage)],
              ["Carburant", label(CARBURANT, v.carburant)],
              ["Carrosserie", label(CARROSSERIE, v.carrosserie)],
              ["Transmission", label(TRANSMISSION, v.transmission)],
              ["Puissance", `${num(v.puissanceCh)} ch`],
              ["Couple", v.coupleNm ? `${num(v.coupleNm)} Nm` : "—"],
              ["Couleur extérieure", v.couleurExt ?? "—"],
              ["Couleur intérieure", v.couleurInt ?? "—"],
              ["Référence", v.refInterne],
            ].map(([k, val]) => (
              <div key={String(k)} className="flex justify-between border-b border-edge py-3.5 font-cond text-sm">
                <span className="text-gris tracking-wide uppercase text-xs pt-0.5">{k}</span>
                <span className="text-white">{String(val)}</span>
              </div>
            ))}
          </div>

          {equipements.length > 0 && (
            <>
              <h3 className="font-display text-3xl mt-14 mb-6">ÉQUIPEMENTS</h3>
              <div className="flex flex-wrap gap-2.5">
                {equipements.map((e) => (
                  <span key={e} className="font-cond text-sm text-gris-clair border border-edge rounded-sm px-3.5 py-2 hover:border-orange transition-colors">
                    {e}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* PANEL À ONGLETS */}
        <div className="lg:sticky lg:top-28 h-fit">
          <VehiclePanel
            vehicleId={v.id}
            prixJour={v.prixJour}
            prixAffiche={v.prixAffiche}
            caution={v.caution}
            canRent={canRent}
            canSell={canSell}
            initial={initialTab}
          />
        </div>
      </section>
    </>
  );
}
