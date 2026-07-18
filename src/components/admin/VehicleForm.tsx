"use client";
import { useActionState } from "react";
import type { AdminFormState } from "@/lib/actions/admin";
import { parseJson } from "@/lib/format";

type Vehicle = Record<string, any> | null;

const field = "w-full bg-noir border border-edge rounded-sm px-3 py-2.5 font-sans text-sm text-white placeholder:text-gris focus:border-orange outline-none transition-colors";
const lbl = "font-cond text-[11px] tracking-[1.5px] uppercase text-gris mb-1.5 block";

export function VehicleForm({
  action,
  vehicle,
}: {
  action: (prev: AdminFormState, fd: FormData) => Promise<AdminFormState>;
  vehicle?: Vehicle;
}) {
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(action, {});
  const v = vehicle ?? {};
  const equip = parseJson<string[]>(v.equipements, []).join(", ");
  const err = (k: string) => state.fieldErrors?.[k];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border border-edge rounded-lg bg-carbone p-5">
      <h3 className="font-cond text-sm tracking-[2px] uppercase text-orange mb-4">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </div>
  );
  const Field = ({ name, label, def, type = "text", ph, req }: { name: string; label: string; def?: any; type?: string; ph?: string; req?: boolean }) => (
    <div>
      <label className={lbl}>{label}{req && <span className="text-orange"> *</span>}</label>
      <input name={name} type={type} defaultValue={def ?? ""} placeholder={ph} className={field} step={type === "number" ? "any" : undefined} />
      {err(name) && <p className="text-red-400 text-xs mt-1">{err(name)}</p>}
    </div>
  );
  const Select = ({ name, label, def, options }: { name: string; label: string; def?: string; options: [string, string][] }) => (
    <div>
      <label className={lbl}>{label}</label>
      <select name={name} defaultValue={def} className={field}>
        {options.map(([val, l]) => <option key={val} value={val}>{l}</option>)}
      </select>
    </div>
  );

  return (
    <form action={formAction} className="space-y-5 max-w-5xl">
      <Section title="Identité">
        <Field name="marque" label="Marque" def={v.marque} ph="Porsche" req />
        <Field name="modele" label="Modèle" def={v.modele} ph="911 GT3" req />
        <Field name="version" label="Version / finition" def={v.version} ph="992" />
        <Field name="annee" label="Année" def={v.annee} type="number" ph="2023" req />
        <Field name="kilometrage" label="Kilométrage" def={v.kilometrage} type="number" ph="6800" />
        <Field name="couleurExt" label="Couleur extérieure" def={v.couleurExt} ph="Blanc Carrara" />
      </Section>

      <Section title="Motorisation & performance">
        <Field name="puissanceCh" label="Puissance (ch)" def={v.puissanceCh} type="number" ph="510" req />
        <Field name="coupleNm" label="Couple (Nm)" def={v.coupleNm} type="number" ph="470" />
        <Field name="accel0100" label="0-100 km/h (s)" def={v.accel0100} type="number" ph="3.4" />
        <Field name="vitesseMax" label="Vitesse max (km/h)" def={v.vitesseMax} type="number" ph="318" />
        <Field name="moteur" label="Moteur" def={v.moteur} ph="Flat-6 4.0" />
        <Select name="carburant" label="Carburant" def={v.carburant ?? "ESSENCE"} options={[["ESSENCE", "Essence"], ["DIESEL", "Diesel"], ["ELECTRIQUE", "Électrique"], ["HYBRIDE", "Hybride"]]} />
        <Select name="boite" label="Boîte" def={v.boite ?? "AUTO"} options={[["AUTO", "Automatique"], ["MANUELLE", "Manuelle"]]} />
        <Select name="transmission" label="Transmission" def={v.transmission ?? "PROPULSION"} options={[["PROPULSION", "Propulsion"], ["TRACTION", "Traction"], ["INTEGRALE", "Intégrale"]]} />
        <Select name="carrosserie" label="Carrosserie" def={v.carrosserie ?? "COUPE"} options={[["COUPE", "Coupé"], ["BERLINE", "Berline"], ["SUV", "SUV"], ["CABRIOLET", "Cabriolet"], ["BREAK", "Break"]]} />
        <Field name="couleurInt" label="Couleur intérieure" def={v.couleurInt} ph="Cuir noir" />
      </Section>

      <Section title="Statut & commercialisation">
        <Select name="statut" label="Statut" def={v.statut ?? "DISPONIBLE"} options={[["EN_ACQUISITION", "En acquisition"], ["EN_PREPARATION", "En préparation"], ["DISPONIBLE", "Disponible"], ["A_VENDRE", "À vendre"], ["A_LOUER", "À louer"], ["RESERVE", "Réservé"], ["LOUE", "Loué"], ["VENDU", "Vendu"], ["EN_MAINTENANCE", "En maintenance"], ["INDISPONIBLE", "Indisponible"]]} />
        <Select name="destination" label="Destination" def={v.destination ?? "LES_DEUX"} options={[["LES_DEUX", "Vente & location"], ["VENTE", "Vente"], ["LOCATION", "Location"]]} />
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 font-cond text-sm text-gris-clair cursor-pointer">
            <input type="checkbox" name="vedette" defaultChecked={!!v.vedette} className="accent-orange w-4 h-4" />
            En vedette (une seule — remplace la voiture vedette actuelle)
          </label>
        </div>
      </Section>

      <Section title="Tarifs">
        <Field name="prixAffiche" label="Prix de vente (€)" def={v.prixAffiche} type="number" ph="219000" />
        <Field name="prixSouhaite" label="Prix souhaité (€)" def={v.prixSouhaite} type="number" />
        <Field name="prixJour" label="Location / jour (€)" def={v.prixJour} type="number" ph="1200" />
        <Field name="prixWeekend" label="Location / week-end (€)" def={v.prixWeekend} type="number" />
        <Field name="prixSemaine" label="Location / semaine (€)" def={v.prixSemaine} type="number" />
        <Field name="caution" label="Caution (€)" def={v.caution} type="number" ph="15000" />
      </Section>

      <div className="border border-edge rounded-lg bg-carbone p-5 space-y-4">
        <div>
          <label className={lbl}>Équipements (séparés par des virgules)</label>
          <input name="equipements" defaultValue={equip} placeholder="Pack Clubsport, Lift system, Chrono Pack" className={field} />
        </div>
        <div>
          <label className={lbl}>Description</label>
          <textarea name="description" defaultValue={v.description ?? ""} rows={3} className={field} placeholder="Le caractère du véhicule…" />
        </div>
      </div>

      {state.error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-sm px-3 py-2">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary disabled:opacity-50">
          {pending ? "Enregistrement…" : vehicle ? "Enregistrer les modifications →" : "Créer le véhicule →"}
        </button>
      </div>
    </form>
  );
}
