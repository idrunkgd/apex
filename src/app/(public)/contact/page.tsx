import { ContactForm } from "@/components/public/ContactForm";
import { Reveal } from "@/components/Reveal";

export default function ContactPage() {
  return (
    <section className="pt-32 pb-24 px-5 md:px-16 min-h-screen grid lg:grid-cols-2 gap-16">
      <div>
        <div className="eyebrow">Contact</div>
        <h1 className="font-display text-[clamp(48px,9vw,130px)] leading-[.88] mt-3">
          PARLONS<br />PERFORMANCE.
        </h1>
        <p className="text-gris-clair font-light max-w-md mt-6 leading-relaxed">
          Une question, un projet d'achat, une envie de conduire ? Notre équipe vous répond et vous accompagne
          avec la même exigence que nos véhicules.
        </p>
        <div className="mt-12 space-y-6 font-cond">
          <div>
            <div className="text-[11px] tracking-[2px] uppercase text-gris">Showroom</div>
            <div className="text-white text-lg">Luxembourg-Ville, Luxembourg</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[2px] uppercase text-gris">Téléphone</div>
            <div className="text-white text-lg">+352 27 00 00 00</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[2px] uppercase text-gris">Email</div>
            <div className="text-white text-lg">contact@apex.lu</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[2px] uppercase text-gris">Horaires</div>
            <div className="text-white text-lg">Lun — Sam · 9h00 — 19h00</div>
          </div>
        </div>
      </div>
      <Reveal>
        <div className="border border-edge rounded-lg bg-carbone p-7 lg:mt-24">
          <div className="font-cond text-sm tracking-[2px] uppercase text-white mb-4">Envoyez-nous un message</div>
          <ContactForm type="CONTACT" submitLabel="Envoyer le message →" />
        </div>
      </Reveal>
    </section>
  );
}
