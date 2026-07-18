import React from "react";
import { Document, Page, View, Text, Image, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { COMPANY, htFromTtc, tvaFromTtc } from "@/lib/company";
import { CHECKIN_ITEMS, CHECKOUT_ITEMS, PHOTO_ANGLES } from "@/lib/checklist";

const ORANGE = "#ff5a00";
const DARK = "#15171c";
const GREY = "#6b7280";
const LINE = "#e5e7eb";

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 44, fontSize: 9.5, color: DARK, fontFamily: "Helvetica", lineHeight: 1.5 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: ORANGE, paddingBottom: 12, marginBottom: 18 },
  brand: { fontSize: 26, fontFamily: "Helvetica-Bold", letterSpacing: 3 },
  brandSub: { fontSize: 8, color: GREY, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 },
  docTitle: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "right", textTransform: "uppercase" },
  docMeta: { fontSize: 8.5, color: GREY, textAlign: "right", marginTop: 3 },
  cols: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18, gap: 20 },
  col: { flex: 1 },
  label: { fontSize: 7.5, color: GREY, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  strong: { fontFamily: "Helvetica-Bold" },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 8, color: ORANGE },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 5 },
  cellL: { flex: 1, color: GREY },
  cellR: { flex: 1, textAlign: "right" },
  th: { flexDirection: "row", backgroundColor: "#f3f4f6", paddingVertical: 5, paddingHorizontal: 6 },
  thText: { fontSize: 7.5, color: GREY, letterSpacing: 1, textTransform: "uppercase" },
  td: { flexDirection: "row", paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 1, borderBottomColor: LINE },
  totalBox: { marginTop: 12, marginLeft: "auto", width: 220 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalFinal: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 7, borderTopWidth: 2, borderTopColor: DARK, marginTop: 4 },
  totalFinalTxt: { fontFamily: "Helvetica-Bold", fontSize: 13 },
  terms: { fontSize: 7.5, color: GREY, marginTop: 4, lineHeight: 1.6 },
  signBlock: { flexDirection: "row", justifyContent: "space-between", marginTop: 34, gap: 30 },
  signBox: { flex: 1, borderTopWidth: 1, borderTopColor: DARK, paddingTop: 6 },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 8, fontSize: 7, color: GREY, textAlign: "center" },
  checkGrid: { flexDirection: "row", flexWrap: "wrap" },
  checkItem: { width: "50%", flexDirection: "row", paddingVertical: 2.5, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: ORANGE, marginRight: 7 },
  meta: { fontSize: 8, color: GREY, marginBottom: 10 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  photoCell: { width: "33.33%", padding: 4 },
  photoImg: { width: "100%", height: 96, objectFit: "cover", borderRadius: 3 },
  photoLabel: { fontSize: 7.5, color: GREY, marginTop: 3, textTransform: "uppercase", letterSpacing: 0.5 },
});

const eur = (n?: number | null) =>
  new Intl.NumberFormat("fr-LU", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n ?? 0);
const dateFr = (d?: Date | string | null) =>
  d ? new Intl.DateTimeFormat("fr-LU", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d)) : "—";

function Header({ title, meta }: { title: string; meta: string[] }) {
  return (
    <View style={s.brandRow}>
      <View>
        <Text style={s.brand}>{COMPANY.nom}</Text>
        <Text style={s.brandSub}>{COMPANY.baseline}</Text>
        <Text style={{ fontSize: 8, color: GREY, marginTop: 8 }}>{COMPANY.adresse}</Text>
        <Text style={{ fontSize: 8, color: GREY }}>{COMPANY.ville} · {COMPANY.pays}</Text>
        <Text style={{ fontSize: 8, color: GREY }}>{COMPANY.email} · {COMPANY.tel}</Text>
        <Text style={{ fontSize: 8, color: GREY }}>TVA {COMPANY.tva}</Text>
      </View>
      <View style={{ maxWidth: 220 }}>
        <Text style={s.docTitle}>{title}</Text>
        {meta.map((m, i) => <Text key={i} style={s.docMeta}>{m}</Text>)}
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>{COMPANY.nom} · {COMPANY.adresse}, {COMPANY.ville} · TVA {COMPANY.tva} · {COMPANY.rcs} · IBAN {COMPANY.iban}</Text>
      <Text
        style={{ marginTop: 2 }}
        render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
          totalPages > 1 ? `Page ${pageNumber} / ${totalPages}` : ""
        }
      />
    </View>
  );
}

function Parties({ customer }: { customer: any }) {
  const nom = customer ? `${customer.prenom ?? ""} ${customer.nom}`.trim() : "Client à confirmer";
  return (
    <View style={s.cols}>
      <View style={s.col}>
        <Text style={s.label}>Loueur</Text>
        <Text style={s.strong}>{COMPANY.nom}</Text>
        <Text>{COMPANY.adresse}</Text>
        <Text>{COMPANY.ville}</Text>
      </View>
      <View style={s.col}>
        <Text style={s.label}>Client</Text>
        <Text style={s.strong}>{nom}</Text>
        {customer?.societe ? <Text>{customer.societe}</Text> : null}
        {customer?.adresse ? <Text>{customer.adresse}</Text> : null}
        {customer?.email ? <Text>{customer.email}</Text> : null}
        {customer?.telephone ? <Text>{customer.telephone}</Text> : null}
      </View>
    </View>
  );
}

function VehicleLine({ v }: { v: any }) {
  return (
    <View>
      <Text style={s.sectionTitle}>Véhicule</Text>
      <View style={s.row}><Text style={s.cellL}>Marque / modèle</Text><Text style={s.cellR}>{v?.marque} {v?.modele} {v?.version ?? ""}</Text></View>
      <View style={s.row}><Text style={s.cellL}>Immatriculation / réf.</Text><Text style={s.cellR}>{v?.plaque ?? v?.refInterne}</Text></View>
      <View style={s.row}><Text style={s.cellL}>Année · puissance</Text><Text style={s.cellR}>{v?.annee} · {v?.puissanceCh} ch</Text></View>
      <View style={s.row}><Text style={s.cellL}>Couleur</Text><Text style={s.cellR}>{v?.couleurExt ?? "—"}</Text></View>
    </View>
  );
}

// --------------------------------------------------------------- CONTRAT
function ContractDoc({ rental, checkIn }: any) {
  const v = rental.vehicle;
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Header title="Contrat de location" meta={[`N° ${rental.reference}`, `Établi le ${dateFr(new Date())}`]} />
        <Parties customer={rental.customer} />
        <VehicleLine v={v} />

        <Text style={s.sectionTitle}>Conditions de la location</Text>
        <View style={s.row}><Text style={s.cellL}>Date de départ</Text><Text style={s.cellR}>{dateFr(rental.dateDepart)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Date de retour</Text><Text style={s.cellR}>{dateFr(rental.dateRetour)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Kilométrage au départ</Text><Text style={s.cellR}>{checkIn?.km != null ? `${checkIn.km} km` : "—"}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Km inclus / jour · km supp.</Text><Text style={s.cellR}>{v?.kmInclusJour ?? "—"} km · {eur(v?.prixKmSupp)}/km</Text></View>
        <View style={s.row}><Text style={s.cellL}>Caution</Text><Text style={s.cellR}>{eur(v?.caution)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Montant de la location</Text><Text style={[s.cellR, s.strong]}>{eur(rental.total)}</Text></View>

        <Text style={s.sectionTitle}>Conditions générales (extrait)</Text>
        <Text style={s.terms}>
          Le locataire déclare avoir le permis de conduire valide requis et être âgé d'au moins {v?.ageMin ?? 25} ans.
          Le véhicule est remis en parfait état, avec les documents de bord et accessoires. Le locataire s'engage à restituer
          le véhicule à la date et au lieu convenus, dans l'état constaté au départ, carburant/charge au niveau initial.
          Tout kilomètre au-delà du forfait inclus est facturé {eur(v?.prixKmSupp)}/km. Tout retard, carburant manquant ou
          dommage constaté au retour fera l'objet d'une facturation complémentaire et pourra être prélevé sur la caution.
          Le locataire demeure responsable des infractions et amendes durant la période de location.
        </Text>

        <View style={s.signBlock}>
          <View style={s.signBox}><Text style={s.label}>Le loueur</Text><Text>{COMPANY.nom}</Text></View>
          <View style={s.signBox}><Text style={s.label}>Le locataire (lu et approuvé)</Text><Text> </Text></View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------- FACTURE
function InvoiceDoc({ rental }: any) {
  const total = (rental.total ?? 0) + (rental.fraisSupp ?? 0);
  const ht = htFromTtc(total);
  const tva = tvaFromTtc(total);
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Header title="Facture" meta={[`N° FAC-${rental.reference}`, `Date ${dateFr(new Date())}`, `Réf. location ${rental.reference}`]} />
        <Parties customer={rental.customer} />

        <Text style={s.sectionTitle}>Détail</Text>
        <View style={s.th}>
          <Text style={[s.thText, { flex: 3 }]}>Désignation</Text>
          <Text style={[s.thText, { flex: 1, textAlign: "right" }]}>Montant TTC</Text>
        </View>
        <View style={s.td}>
          <Text style={{ flex: 3 }}>Location {rental.vehicle?.marque} {rental.vehicle?.modele} — du {dateFr(rental.dateDepart)} au {dateFr(rental.dateRetour)}</Text>
          <Text style={{ flex: 1, textAlign: "right" }}>{eur(rental.total)}</Text>
        </View>
        {rental.fraisSupp ? (
          <View style={s.td}>
            <Text style={{ flex: 3 }}>Frais supplémentaires (km / retard / carburant)</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{eur(rental.fraisSupp)}</Text>
          </View>
        ) : null}

        <View style={s.totalBox}>
          <View style={s.totalRow}><Text style={{ color: GREY }}>Total HT</Text><Text>{eur(ht)}</Text></View>
          <View style={s.totalRow}><Text style={{ color: GREY }}>TVA ({Math.round(COMPANY.tvaTaux * 100)} %)</Text><Text>{eur(tva)}</Text></View>
          <View style={s.totalFinal}><Text style={s.totalFinalTxt}>Total TTC</Text><Text style={s.totalFinalTxt}>{eur(total)}</Text></View>
        </View>

        <Text style={[s.terms, { marginTop: 20 }]}>
          Règlement par virement sur le compte {COMPANY.iban} en indiquant la référence FAC-{rental.reference}.
          TVA acquittée sur les débits. Merci de votre confiance.
        </Text>
        <Footer />
      </Page>
    </Document>
  );
}

// --------------------------------------------------------------- ÉTAT DES LIEUX
function dateTimeFr(d?: Date | string | null) {
  return d
    ? new Intl.DateTimeFormat("fr-LU", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d))
    : "—";
}

function InspectionDoc({ rental, inspection, phase, photoList = [] }: any) {
  const items = phase === "retour" ? CHECKOUT_ITEMS : CHECKIN_ITEMS;
  const check = inspection?.checklist ? JSON.parse(inspection.checklist) : {};
  const done = items.filter((it) => check[it.key]);
  const notDone = items.filter((it) => !check[it.key]);

  const phaseLabel = phase === "retour" ? "retour" : "départ";
  const ContTag = ({ sub }: { sub: string }) => (
    <View style={s.brandRow}>
      <View>
        <Text style={s.brand}>{COMPANY.nom}</Text>
        <Text style={s.brandSub}>{COMPANY.baseline}</Text>
      </View>
      <View>
        <Text style={s.docTitle}>{sub}</Text>
        <Text style={s.docMeta}>État des lieux {phaseLabel} · {rental.reference}</Text>
      </View>
    </View>
  );

  return (
    <Document>
      {/* PAGE 1 — DÉTAIL DE LA LOCATION */}
      <Page size="A4" style={s.page}>
        <Header
          title={`État des lieux — ${phaseLabel}`}
          meta={[`Location ${rental.reference}`, dateTimeFr(inspection?.createdAt)]}
        />
        <Parties customer={rental.customer} />
        <Text style={s.meta}>Réalisé par {inspection?.agentNom ?? "—"} · le {dateTimeFr(inspection?.createdAt)}</Text>
        <VehicleLine v={rental.vehicle} />

        <Text style={s.sectionTitle}>Conditions de la location</Text>
        <View style={s.row}><Text style={s.cellL}>Date de départ</Text><Text style={s.cellR}>{dateFr(rental.dateDepart)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Date de retour</Text><Text style={s.cellR}>{dateFr(rental.dateRetour)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Montant de la location</Text><Text style={s.cellR}>{eur(rental.total)}</Text></View>

        <Text style={s.sectionTitle}>Relevés</Text>
        <View style={s.row}><Text style={s.cellL}>Kilométrage</Text><Text style={s.cellR}>{inspection?.km != null ? `${inspection.km} km` : "—"}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Carburant / charge</Text><Text style={s.cellR}>{inspection?.carburant != null ? `${inspection.carburant} %` : "—"}</Text></View>
        {phase === "retour" ? (
          <>
            <View style={s.row}><Text style={s.cellL}>Frais km supplémentaires</Text><Text style={s.cellR}>{eur(inspection?.fraisKm)}</Text></View>
            <View style={s.row}><Text style={s.cellL}>Frais retard</Text><Text style={s.cellR}>{eur(inspection?.fraisRetard)}</Text></View>
            <View style={s.row}><Text style={s.cellL}>Frais carburant</Text><Text style={s.cellR}>{eur(inspection?.fraisCarburant)}</Text></View>
          </>
        ) : null}

        <Text style={s.sectionTitle}>Contrôles effectués</Text>
        <View style={s.checkGrid}>
          {done.map((it) => (
            <View key={it.key} style={s.checkItem}>
              <View style={s.dot} />
              <Text style={{ fontSize: 9 }}>{it.label}</Text>
            </View>
          ))}
        </View>
        {notDone.length > 0 && (
          <Text style={{ fontSize: 8, color: GREY, marginTop: 6 }}>Non renseigné : {notDone.map((it) => it.label).join(", ")}.</Text>
        )}
        <Footer />
      </Page>

      {/* PAGE 2 — PHOTOS */}
      <Page size="A4" style={s.page}>
        <ContTag sub="Photos" />
        <Text style={s.sectionTitle}>Photos de l'état des lieux</Text>
        {photoList.length > 0 ? (
          <View style={s.photoGrid}>
            {photoList.map((p: { label: string; src: string }, i: number) => (
              <View key={i} style={s.photoCell}>
                <Image src={p.src} style={s.photoImg} />
                <Text style={s.photoLabel}>{p.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ fontSize: 9, color: GREY }}>Aucune photo jointe à cet état des lieux.</Text>
        )}
        <Footer />
      </Page>

      {/* PAGE 3 — COMPLÉMENTS & SIGNATURE */}
      <Page size="A4" style={s.page}>
        <ContTag sub="Compléments & signature" />

        <Text style={s.sectionTitle}>Compléments</Text>
        <View style={s.row}><Text style={s.cellL}>État des lieux réalisé par</Text><Text style={s.cellR}>{inspection?.agentNom ?? "—"}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Date et heure</Text><Text style={s.cellR}>{dateTimeFr(inspection?.createdAt)}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Nombre de photos jointes</Text><Text style={s.cellR}>{photoList.length}</Text></View>
        <View style={s.row}><Text style={s.cellL}>Contrôles validés</Text><Text style={s.cellR}>{done.length} / {done.length + notDone.length}</Text></View>

        <Text style={s.terms}>
          Le présent état des lieux {phaseLabel} fait foi de l'état du véhicule au moment de la {phase === "retour" ? "restitution" : "remise"}.
          Les parties reconnaissent l'exactitude des relevés, des contrôles et des photographies annexées.
        </Text>

        <View style={[s.signBlock, { marginTop: 50 }]}>
          <View style={s.signBox}>
            <Text style={s.label}>Le loueur — {COMPANY.nom}</Text>
            <Text>{inspection?.agentNom ?? " "}</Text>
          </View>
          <View style={s.signBox}>
            <Text style={s.label}>Le client</Text>
            {inspection?.signature ? <Image src={inspection.signature} style={{ height: 44, objectFit: "contain", marginTop: 2 }} /> : null}
            <Text>{rental.customer ? `${rental.customer.prenom ?? ""} ${rental.customer.nom}` : " "}</Text>
          </View>
        </View>
        <Footer />
      </Page>
    </Document>
  );
}

export type DocType = "contrat" | "facture" | "edl-depart" | "edl-retour";

export function renderRentalPdf(type: DocType, data: any): Promise<Buffer> {
  let el: React.ReactElement;
  switch (type) {
    case "facture": el = <InvoiceDoc rental={data.rental} />; break;
    case "edl-depart": el = <InspectionDoc rental={data.rental} inspection={data.checkIn} phase="depart" photoList={data.checkInPhotos ?? []} />; break;
    case "edl-retour": el = <InspectionDoc rental={data.rental} inspection={data.checkOut} phase="retour" photoList={data.checkOutPhotos ?? []} />; break;
    default: el = <ContractDoc rental={data.rental} checkIn={data.checkIn} />;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(el as any);
}

export const DOC_LABELS: Record<DocType, string> = {
  contrat: "Contrat de location",
  facture: "Facture",
  "edl-depart": "État des lieux — départ",
  "edl-retour": "État des lieux — retour",
};
