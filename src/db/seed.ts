import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import * as s from "./schema";

const url = process.env.DATABASE_URL || "file:./dev.db";
const client = createClient({ url });
const db = drizzle(client, { schema: s });

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("→ Nettoyage…");
  for (const t of [
    s.activityLogs, s.notifications, s.contracts, s.deposits, s.payments,
    s.checkOuts, s.checkIns, s.vehicleDamages, s.rentals, s.reservations,
    s.sales, s.purchases, s.leads, s.customerDocuments, s.customers,
    s.vehicleMaintenance, s.vehicleExpenses, s.statusHistory, s.vehiclePhotos,
    s.vehicles, s.users,
  ]) {
    await db.delete(t);
  }

  console.log("→ Utilisateurs…");
  const pw = await bcrypt.hash("apex1234", 10);
  await db.insert(s.users).values([
    { email: "admin@apex.lu", passwordHash: pw, nom: "Alexandre Dumont", role: "ADMIN" },
    { email: "gestion@apex.lu", passwordHash: pw, nom: "Camille Reuter", role: "GESTIONNAIRE" },
    { email: "employe@apex.lu", passwordHash: pw, nom: "Luca Bianchi", role: "EMPLOYE" },
    { email: "compta@apex.lu", passwordHash: pw, nom: "Sophie Weber", role: "COMPTABILITE" },
  ]);

  console.log("→ Véhicules…");
  type V = {
    marque: string; modele: string; version?: string; annee: number; km: number;
    carburant?: string; ch: number; couple?: number; accel: number; vmax: number;
    moteur?: string; transmission?: string; carrosserie?: string;
    couleurExt: string; couleurInt?: string; statut: string; destination: string; vedette?: boolean;
    prixAffiche?: number; prixSouhaite?: number;
    prixJour?: number; prixWeekend?: number; prixSemaine?: number; caution?: number;
    equip: string[]; desc: string;
  };

  const vehicles: V[] = [
    { marque: "Porsche", modele: "911 GT3", version: "992", annee: 2023, km: 6800, ch: 510, couple: 470, accel: 3.4, vmax: 318, moteur: "Flat-6 4.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Blanc Carrara", couleurInt: "Cuir noir / Alcantara", statut: "A_LOUER", destination: "LES_DEUX", vedette: true, prixAffiche: 219000, prixJour: 1200, prixWeekend: 3200, prixSemaine: 7000, caution: 15000, equip: ["Pack Clubsport", "Sièges baquets carbone", "Chrono Pack", "Lift system"], desc: "La référence de la piste homologuée route. Moteur atmosphérique hurlant jusqu'à 9000 tr/min." },
    { marque: "Lamborghini", modele: "Huracán", version: "EVO", annee: 2022, km: 9400, ch: 640, couple: 600, accel: 2.9, vmax: 325, moteur: "V10 5.2", carrosserie: "COUPE", transmission: "INTEGRALE", couleurExt: "Verde Mantis", couleurInt: "Cuir noir / vert", statut: "DISPONIBLE", destination: "LOCATION", vedette: true, prixJour: 1900, prixWeekend: 5000, prixSemaine: 11000, caution: 20000, equip: ["Lifting system", "Échappement sport", "Style Pack", "Caméra recul"], desc: "Le V10 atmosphérique dans sa forme la plus pure. Une sonorité et une agilité incomparables." },
    { marque: "Ferrari", modele: "296 GTB", annee: 2023, km: 4200, ch: 830, couple: 740, accel: 2.9, vmax: 330, moteur: "V6 Hybride 3.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Rosso Corsa", couleurInt: "Cuir crème", statut: "LOUE", destination: "LOCATION", vedette: true, prixJour: 2200, prixWeekend: 5800, prixSemaine: 12500, caution: 25000, equip: ["Assetto Fiorano", "Freins carbo-céramique", "Lift", "Jantes forgées"], desc: "L'hybride selon Ferrari : 830 ch, réactivité électrique et pur plaisir thermique." },
    { marque: "McLaren", modele: "750S", annee: 2024, km: 1900, ch: 750, couple: 800, accel: 2.8, vmax: 332, moteur: "V8 Biturbo 4.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Orange Papaya", couleurInt: "Alcantara noir", statut: "A_VENDRE", destination: "LES_DEUX", vedette: true, prixAffiche: 329000, prixJour: 2400, caution: 25000, equip: ["Toit vitré", "Audio Bowers & Wilkins", "Practicality Pack"], desc: "Châssis carbone, poids plume, précision chirurgicale. La supercar la plus légère de sa catégorie." },
    { marque: "Mercedes-AMG", modele: "GT 63", version: "4-Portes", annee: 2022, km: 21000, ch: 585, couple: 800, accel: 3.2, vmax: 315, moteur: "V8 Biturbo 4.0", carrosserie: "BERLINE", transmission: "INTEGRALE", couleurExt: "Gris Selenite", couleurInt: "Cuir Nappa rouge", statut: "A_LOUER", destination: "LES_DEUX", prixAffiche: 129000, prixJour: 980, prixWeekend: 2600, prixSemaine: 5800, caution: 10000, equip: ["Toit panoramique", "Burmester", "Sièges chauffants/ventilés", "Pack Night"], desc: "La GT à quatre portes : confort de grande routière, performances de supercar." },
    { marque: "Audi", modele: "RS6 Avant", version: "Performance", annee: 2023, km: 15600, ch: 630, couple: 850, accel: 3.4, vmax: 305, moteur: "V8 Biturbo 4.0", carrosserie: "BREAK", transmission: "INTEGRALE", couleurExt: "Gris Nardo", couleurInt: "Cuir noir surpiqûres rouges", statut: "LOUE", destination: "LOCATION", prixJour: 690, prixWeekend: 1800, prixSemaine: 3900, caution: 8000, equip: ["Dynamic Package", "Freins céramique", "B&O 3D", "Suspension pneumatique"], desc: "Le break familial le plus rapide du monde. 630 ch et 5 vraies places." },
    { marque: "BMW", modele: "M4 Competition", annee: 2023, km: 12300, ch: 510, couple: 650, accel: 3.5, vmax: 290, moteur: "6-en-ligne 3.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Bleu Portimao", couleurInt: "Cuir Merino", statut: "DISPONIBLE", destination: "LES_DEUX", prixAffiche: 89000, prixJour: 590, prixWeekend: 1500, prixSemaine: 3200, caution: 6000, equip: ["M Carbon", "Harman Kardon", "Head-up", "Toit carbone"], desc: "L'icône M dans sa forme la plus aboutie. Propulsion, six cylindres, sensations garanties." },
    { marque: "Porsche", modele: "Taycan Turbo S", annee: 2023, km: 18900, ch: 761, couple: 1050, accel: 2.8, vmax: 260, moteur: "Électrique bi-moteur", carrosserie: "BERLINE", transmission: "INTEGRALE", couleurExt: "Noir Volcan", couleurInt: "Cuir Race-Tex", statut: "A_LOUER", destination: "LES_DEUX", prixAffiche: 149000, prixJour: 850, prixWeekend: 2200, prixSemaine: 4800, caution: 10000, carburant: "ELECTRIQUE", equip: ["Recharge 270 kW", "Sport Chrono", "PDCC", "Toit panoramique"], desc: "La performance électrique sans compromis. 761 ch et un couple instantané foudroyant." },
    { marque: "Range Rover", modele: "Sport SV", annee: 2024, km: 5400, ch: 635, couple: 750, accel: 3.8, vmax: 290, moteur: "V8 Biturbo 4.4", carrosserie: "SUV", transmission: "INTEGRALE", couleurExt: "Noir Santorini", couleurInt: "Cuir Windsor", statut: "DISPONIBLE", destination: "LES_DEUX", prixAffiche: 189000, prixJour: 750, prixWeekend: 1900, prixSemaine: 4200, caution: 10000, equip: ['Body & Soul Seat', "Carbon Pack", 'Roues 23"', "Meridian Signature"], desc: "Le SUV de luxe qui joue dans la cour des sportives. Puissance, prestance, exclusivité." },
    { marque: "Aston Martin", modele: "Vantage", annee: 2022, km: 14800, ch: 665, couple: 800, accel: 3.5, vmax: 314, moteur: "V8 Biturbo 4.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Vert British Racing", couleurInt: "Cuir tan", statut: "A_VENDRE", destination: "VENTE", prixAffiche: 159000, prixSouhaite: 152000, equip: ["Échappement sport", "Jantes forgées", "Pack carbone extérieur"], desc: "L'élégance britannique et le caractère d'un pur GT sportif. Rare et désirable." },
    { marque: "Bentley", modele: "Continental GT Speed", annee: 2021, km: 26700, ch: 659, couple: 900, accel: 3.6, vmax: 335, moteur: "W12 6.0", carrosserie: "COUPE", transmission: "INTEGRALE", couleurExt: "Gris Anthracite", couleurInt: "Cuir bicolore", statut: "A_VENDRE", destination: "VENTE", prixAffiche: 219000, prixSouhaite: 209000, equip: ["Rotating Display", "Naim Audio", "Mulliner Driving Spec", "Toit ouvrant"], desc: "Le grand tourisme absolu. W12, artisanat d'exception, performances stupéfiantes." },
    { marque: "Porsche", modele: "718 Cayman GT4", version: "RS", annee: 2023, km: 8100, ch: 500, couple: 450, accel: 3.4, vmax: 315, moteur: "Flat-6 4.0", carrosserie: "COUPE", transmission: "PROPULSION", couleurExt: "Bleu Requin", couleurInt: "Race-Tex noir", statut: "DISPONIBLE", destination: "LES_DEUX", prixAffiche: 149000, prixJour: 990, prixWeekend: 2600, prixSemaine: 5600, caution: 12000, equip: ["Pack Weissach", "Sièges baquets", "Arceau", "Jantes magnésium"], desc: "Un moteur de 911 GT3 dans un châssis à moteur central. La Porsche du puriste." },
  ];

  const created: (typeof s.vehicles.$inferSelect)[] = [];
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    const ref = `APX-${1001 + i}`;
    const [row] = await db
      .insert(s.vehicles)
      .values({
        refInterne: ref,
        slug: slugify(`${v.marque}-${v.modele}-${ref}`),
        marque: v.marque,
        modele: v.modele,
        version: v.version,
        annee: v.annee,
        kilometrage: v.km,
        carburant: v.carburant ?? "ESSENCE",
        puissanceCh: v.ch,
        coupleNm: v.couple,
        accel0100: v.accel,
        vitesseMax: v.vmax,
        moteur: v.moteur,
        transmission: v.transmission ?? "PROPULSION",
        carrosserie: v.carrosserie ?? "COUPE",
        couleurExt: v.couleurExt,
        couleurInt: v.couleurInt,
        statut: v.statut,
        destination: v.destination,
        vedette: v.vedette ?? false,
        prixAffiche: v.prixAffiche,
        prixSouhaite: v.prixSouhaite,
        prixJour: v.prixJour,
        prixWeekend: v.prixWeekend,
        prixSemaine: v.prixSemaine,
        caution: v.caution,
        ageMin: v.prixJour ? 25 : null,
        anciennetePermis: v.prixJour ? 3 : null,
        kmInclusJour: v.prixJour ? 150 : null,
        prixKmSupp: v.prixJour ? 3 : null,
        equipements: JSON.stringify(v.equip),
        description: v.desc,
      })
      .returning();
    created.push(row);

    await db.insert(s.vehiclePhotos).values([
      { vehicleId: row.id, categorie: "EXTERIEUR", ordre: 0, cover: true },
      { vehicleId: row.id, categorie: "INTERIEUR", ordre: 1 },
      { vehicleId: row.id, categorie: "MOTEUR", ordre: 2 },
      { vehicleId: row.id, categorie: "JANTES", ordre: 3 },
    ]);
    await db.insert(s.statusHistory).values({ vehicleId: row.id, nouveauStatut: v.statut, raison: "Import initial" });
  }

  console.log("→ Achats / dépenses…");
  const fournisseurs = ["Auction Monaco", "Import Allemagne", "Reprise client", "Réseau pro"];
  for (let i = 0; i < created.length; i++) {
    const v = created[i];
    const base = Math.round((v.prixAffiche ?? v.prixSouhaite ?? 80000) * 0.82);
    await db.insert(s.purchases).values({
      vehicleId: v.id,
      fournisseur: fournisseurs[i % 4],
      prixAchat: base,
      tva: Math.round(base * 0.17),
      transport: 1200,
      preparation: 2500,
      detailing: 800,
      pneus: 1400,
    });
    await db.insert(s.vehicleExpenses).values({
      vehicleId: v.id, categorie: "ENTRETIEN", montant: 950, note: "Révision d'entrée en flotte",
    });
  }

  console.log("→ Clients…");
  const custData = [
    { nom: "Lefèvre", prenom: "Julien", email: "j.lefevre@mail.com", telephone: "+352 621 11 22 33", type: "PARTICULIER" as const },
    { nom: "Schmit", prenom: "Marie", email: "marie.schmit@mail.com", telephone: "+352 661 44 55 66", type: "PARTICULIER" as const },
    { nom: "Rossi", prenom: "Marco", email: "m.rossi@mail.com", telephone: "+352 691 77 88 99", type: "PARTICULIER" as const },
    { nom: "Kessler", prenom: "Thomas", societe: "Kessler Invest SA", email: "contact@kessler-invest.lu", telephone: "+352 27 00 12 34", type: "SOCIETE" as const },
    { nom: "Da Silva", prenom: "Ana", email: "ana.dasilva@mail.com", telephone: "+352 621 98 76 54", type: "PARTICULIER" as const },
  ];
  const customers: (typeof s.customers.$inferSelect)[] = [];
  for (let i = 0; i < custData.length; i++) {
    const c = custData[i];
    const [row] = await db.insert(s.customers).values({
      type: c.type, nom: c.nom, prenom: c.prenom, societe: (c as any).societe,
      email: c.email, telephone: c.telephone,
      numeroPermis: "LU" + (100000 + i * 12345),
      permisDelivre: new Date(2012, 4, 12), permisExpire: new Date(2032, 4, 12),
    }).returning();
    customers.push(row);
  }

  console.log("→ Réservations & locations…");
  const nowD = Date.now();
  const addDays = (d: number) => new Date(nowD + d * 86400000);

  await db.insert(s.reservations).values({
    reference: "RES-2001", vehicleId: created[1].id, customerId: customers[0].id,
    dateDepart: addDays(5), dateRetour: addDays(8), prixTotal: 5700, caution: 20000, statut: "CONFIRMEE", source: "SITE",
  });
  await db.insert(s.reservations).values({
    reference: "RES-2002", vehicleId: created[7].id,
    contactNom: "Pierre Muller", contactEmail: "p.muller@mail.com", contactTel: "+352 621 00 11 22",
    dateDepart: addDays(2), dateRetour: addDays(4), prixTotal: 2550, statut: "DEMANDE", source: "SITE",
  });

  const [rentalRes] = await db.insert(s.reservations).values({
    reference: "RES-2003", vehicleId: created[2].id, customerId: customers[3].id,
    dateDepart: addDays(-2), dateRetour: addDays(3), prixTotal: 11000, caution: 25000, statut: "EN_COURS", source: "BACKOFFICE",
  }).returning();
  const [rental] = await db.insert(s.rentals).values({
    reference: "LOC-3001", reservationId: rentalRes.id, vehicleId: created[2].id, customerId: customers[3].id,
    dateDepart: addDays(-2), dateRetour: addDays(3), dateDepartReel: addDays(-2),
    kmDepart: created[2].kilometrage, carburantDepart: 90, total: 11000, statut: "EN_COURS",
  }).returning();
  await db.insert(s.deposits).values({ rentalId: rental.id, montant: 25000, statut: "BLOQUEE" });
  await db.insert(s.payments).values({ rentalId: rental.id, customerId: customers[3].id, montant: 11000, type: "LOCATION", methode: "VIREMENT", statut: "PAYE" });

  const [pastRes] = await db.insert(s.reservations).values({
    reference: "RES-2004", vehicleId: created[5].id, customerId: customers[2].id,
    dateDepart: addDays(-20), dateRetour: addDays(-15), prixTotal: 3450, statut: "TERMINEE", source: "SITE",
  }).returning();
  await db.insert(s.rentals).values({
    reference: "LOC-3000", reservationId: pastRes.id, vehicleId: created[5].id, customerId: customers[2].id,
    dateDepart: addDays(-20), dateRetour: addDays(-15), dateDepartReel: addDays(-20), dateRetourReel: addDays(-15),
    kmDepart: created[5].kilometrage - 900, kmRetour: created[5].kilometrage, carburantDepart: 100, carburantRetour: 40,
    total: 3450, statut: "TERMINEE",
  });

  console.log("→ Prospects (vente)…");
  await db.insert(s.sales).values({ vehicleId: created[3].id, customerId: customers[1].id, statut: "OFFRE", prixAffiche: 329000, prixNegocie: 315000 });
  await db.insert(s.sales).values({ vehicleId: created[9].id, statut: "PROSPECT", prixAffiche: 159000 });
  await db.insert(s.leads).values({ activite: "VENTE", vehicleId: created[10].id, nom: "Vincent Klein", email: "v.klein@mail.com", telephone: "+352 661 22 33 44", message: "Intéressé par la Continental GT, possibilité d'essai ?", statut: "NOUVEAU" });

  console.log("→ Maintenance & notifications…");
  await db.insert(s.vehicleMaintenance).values({ vehicleId: created[0].id, type: "CT", date: addDays(20), prochaineDate: addDays(20), statut: "PLANIFIE", note: "Contrôle technique à prévoir" });
  await db.insert(s.notifications).values([
    { type: "DEPART", message: "Départ aujourd'hui : Ferrari 296 GTB (LOC-3001)", lien: "/admin/locations" },
    { type: "PAIEMENT", message: "Paiement en attente : réservation RES-2002", cibleRole: "COMPTABILITE", lien: "/admin/reservations" },
    { type: "MAINTENANCE", message: "Contrôle technique à planifier : Porsche 911 GT3", lien: "/admin/flotte" },
  ]);

  console.log("✓ Seed terminé. Connexion admin : admin@apex.lu / apex1234");
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
